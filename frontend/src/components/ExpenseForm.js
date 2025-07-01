import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

const ExpenseForm = ({ onExpenseAdded }) => {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        category: '团建',
        description: '',
        amount: '',
        payer_id: '',
        participants: []
    });

    const categories = ['团建', '法务', '其他'];

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const usersData = await apiService.getUsers();
            setUsers(usersData);
        } catch (error) {
            console.error('加载用户失败:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.description || !formData.amount || !formData.payer_id || formData.participants.length === 0) {
            alert('请填写所有必填字段');
            return;
        }

        try {
            await apiService.createExpense({
                ...formData,
                amount: parseFloat(formData.amount)
            });

            // 重置表单
            setFormData({
                date: new Date().toISOString().split('T')[0],
                category: '团建',
                description: '',
                amount: '',
                payer_id: '',
                participants: []
            });

            onExpenseAdded();
            alert('费用记录添加成功！');
        } catch (error) {
            console.error('添加费用失败:', error);
            alert('添加费用失败，请重试');
        }
    };

    const handleParticipantChange = (userId) => {
        setFormData(prev => ({
            ...prev,
            participants: prev.participants.includes(userId)
                ? prev.participants.filter(id => id !== userId)
                : [...prev.participants, userId]
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">添加新费用</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 日期 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
                    <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                {/* 类别 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">类别</label>
                    <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* 金额 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">金额</label>
                    <input
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                        required
                    />
                </div>

                {/* 描述 */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                    <input
                        type="text"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="费用描述"
                        required
                    />
                </div>

                {/* 付款人 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">付款人</label>
                    <select
                        value={formData.payer_id}
                        onChange={(e) => setFormData({ ...formData, payer_id: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="">选择付款人</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 参与分摊人员 */}
            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">参与分摊人员</label>
                <div className="flex flex-wrap gap-2">
                    {users.map(user => (
                        <label key={user.id} className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.participants.includes(user.id)}
                                onChange={() => handleParticipantChange(user.id)}
                                className="mr-2"
                            />
                            <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                                {user.name}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            <button
                type="submit"
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                添加费用
            </button>
        </form>
    );
};

export default ExpenseForm;