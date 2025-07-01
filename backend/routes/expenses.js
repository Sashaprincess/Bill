const express = require('express');
const router = express.Router();
const db = require('../database');

// 获取所有费用记录（包含详细信息）
router.get('/', (req, res) => {
    const query = `
    SELECT 
      e.*,
      u.name as payer_name,
      GROUP_CONCAT(pu.name) as participants
    FROM expenses e
    LEFT JOIN users u ON e.payer_id = u.id
    LEFT JOIN expense_participants ep ON e.id = ep.expense_id
    LEFT JOIN users pu ON ep.user_id = pu.id
    GROUP BY e.id
    ORDER BY e.date DESC, e.created_at DESC
  `;

    db.all(query, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        // 处理参与者数据
        const expenses = rows.map(row => ({
            ...row,
            participants: row.participants ? row.participants.split(',') : []
        }));

        res.json(expenses);
    });
});

// 创建新的费用记录
router.post('/', (req, res) => {
    const { date, category, description, amount, payer_id, participants } = req.body;

    // 验证必填字段
    if (!date || !category || !description || !amount || !payer_id || !participants) {
        return res.status(400).json({ error: '请填写所有必填字段' });
    }

    // 计算人均金额
    const per_person = participants.length > 0 ? (amount / participants.length) : 0;

    // 开始事务
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // 插入费用记录
        db.run(
            'INSERT INTO expenses (date, category, description, amount, payer_id, per_person) VALUES (?, ?, ?, ?, ?, ?)',
            [date, category, description, amount, payer_id, per_person],
            function (err) {
                if (err) {
                    db.run('ROLLBACK');
                    res.status(500).json({ error: err.message });
                    return;
                }

                const expenseId = this.lastID;

                // 插入参与者记录
                const participantInserts = participants.map(userId =>
                    new Promise((resolve, reject) => {
                        db.run(
                            'INSERT INTO expense_participants (expense_id, user_id) VALUES (?, ?)',
                            [expenseId, userId],
                            (err) => {
                                if (err) reject(err);
                                else resolve();
                            }
                        );
                    })
                );

                Promise.all(participantInserts)
                    .then(() => {
                        db.run('COMMIT');
                        res.status(201).json({
                            id: expenseId,
                            date,
                            category,
                            description,
                            amount,
                            payer_id,
                            per_person,
                            participants
                        });
                    })
                    .catch(err => {
                        db.run('ROLLBACK');
                        res.status(500).json({ error: err.message });
                    });
            }
        );
    });
});

// 获取个人账单明细
router.get('/summary/:userId', (req, res) => {
    const userId = req.params.userId;

    const query = `
    SELECT 
      u.name,
      COALESCE(paid.total_paid, 0) as total_paid,
      COALESCE(owed.total_owed, 0) as total_owed,
      (COALESCE(paid.total_paid, 0) - COALESCE(owed.total_owed, 0)) as balance
    FROM users u
    LEFT JOIN (
      SELECT payer_id, SUM(amount) as total_paid
      FROM expenses 
      WHERE payer_id = ?
      GROUP BY payer_id
    ) paid ON u.id = paid.payer_id
    LEFT JOIN (
      SELECT ep.user_id, SUM(e.per_person) as total_owed
      FROM expense_participants ep
      JOIN expenses e ON ep.expense_id = e.id
      WHERE ep.user_id = ?
      GROUP BY ep.user_id
    ) owed ON u.id = owed.user_id
    WHERE u.id = ?
  `;

    db.get(query, [userId, userId, userId], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(row || { name: '', total_paid: 0, total_owed: 0, balance: 0 });
    });
});

// 更新费用状态
router.patch('/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    db.run('UPDATE expenses SET status = ? WHERE id = ?', [status, id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: '状态更新成功' });
    });
});

// 获取未结算费用的个人汇总
router.get('/unsettled-summary/:userId', (req, res) => {
    const userId = req.params.userId;

    const query = `
    SELECT 
      u.name,
      COALESCE(paid.total_paid, 0) as total_paid,
      COALESCE(owed.total_owed, 0) as total_owed,
      (COALESCE(paid.total_paid, 0) - COALESCE(owed.total_owed, 0)) as balance
    FROM users u
    LEFT JOIN (
      SELECT payer_id, SUM(amount) as total_paid
      FROM expenses 
      WHERE payer_id = ? AND status = '未结算'
      GROUP BY payer_id
    ) paid ON u.id = paid.payer_id
    LEFT JOIN (
      SELECT ep.user_id, SUM(e.per_person) as total_owed
      FROM expense_participants ep
      JOIN expenses e ON ep.expense_id = e.id
      WHERE ep.user_id = ? AND e.status = '未结算'
      GROUP BY ep.user_id
    ) owed ON u.id = owed.user_id
    WHERE u.id = ?
  `;

    db.get(query, [userId, userId, userId], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(row || { name: '', total_paid: 0, total_owed: 0, balance: 0 });
    });
});
module.exports = router;