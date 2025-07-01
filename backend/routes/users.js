const express = require('express');
const router = express.Router();
const db = require('../database');

// 获取所有用户
router.get('/', (req, res) => {
    db.all('SELECT * FROM users ORDER BY name', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// 创建新用户
router.post('/', (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: '用户名不能为空' });
    }

    db.run('INSERT INTO users (name) VALUES (?)', [name], function (err) {
        if (err) {
            if (err.code === 'SQLITE_CONSTRAINT') {
                return res.status(400).json({ error: '用户名已存在' });
            }
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ id: this.lastID, name });
    });
});

module.exports = router;