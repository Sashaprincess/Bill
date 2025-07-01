import React from 'react';
import apiService from '../services/api';

const ExpenseList = ({ expenses, onExpenseUpdated }) => {
    const handleStatusChange = async (expenseId, newStatus) => {
        try {
            await apiService.updateExpenseStatus(expenseId, newStatus);
            onExpenseUpdated();
        } catch (error) {
            console.error('更新状态失败:', error);
            alert('更新状态失败，请重试');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('zh-CN');
    };

    const getStatusColor = (status) => {
        return status === '已结算' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <h2 className="text-xl font-bold p-4 bg-gray-50 border-b">费用记录</h2>

            {expenses.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                    暂无费用记录
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">日期</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">类别</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">描述</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">金额</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">付款人</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">参与分摊</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">人均</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {expenses.map((expense) => (
                                <tr key={expense.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {formatDate(expense.date)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {expense.category}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {expense.description}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                        ${expense.amount.toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {expense.payer_name}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        <div className="flex flex-wrap gap-1">
                                            {expense.participants.map((participant, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                                                >
                                                    {participant}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                        ${expense.per_person.toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                                            {expense.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <select
                                            value={expense.status}
                                            onChange={(e) => handleStatusChange(expense.id, e.target.value)}
                                            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        >
                                            <option value="未结算">未结算</option>
                                            <option value="已结算">已结算</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ExpenseList;