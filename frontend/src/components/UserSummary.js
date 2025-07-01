import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

const UserSummary = ({ users, expenses }) => {
    const [userSummaries, setUserSummaries] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (users.length > 0) {
            loadUserSummaries();
        }
    }, [users, expenses]);

    const loadUserSummaries = async () => {
        setLoading(true);
        try {
            const summaries = await Promise.all(
                users.map(async (user) => {
                    const summary = await apiService.getUserSummary(user.id);
                    return { ...summary, id: user.id };
                })
            );
            setUserSummaries(summaries);
        } catch (error) {
            console.error('加载用户汇总失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const getBalanceColor = (balance) => {
        if (balance > 0) return 'text-green-600';
        if (balance < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    const getBalanceText = (balance) => {
        if (balance > 0) return `净余额: +$${balance.toFixed(2)}`;
        if (balance < 0) return `净余额: -$${Math.abs(balance).toFixed(2)}`;
        return '净余额: $0.00';
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4 text-gray-800">个人账单明细</h2>
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-500">加载中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800">个人账单明细</h2>

            {userSummaries.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    暂无数据
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userSummaries.map((summary) => (
                        <div
                            key={summary.id}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                            <h3 className="font-semibold text-lg text-gray-800 mb-3">
                                {summary.name}
                            </h3>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">总支付:</span>
                                    <span className="font-medium">${summary.total_paid.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">未结费用:</span>
                                    <span className="font-medium">${summary.total_owed.toFixed(2)}</span>
                                </div>

                                <hr className="my-2" />

                                <div className="flex justify-between font-semibold">
                                    <span className={getBalanceColor(summary.balance)}>
                                        {getBalanceText(summary.balance)}
                                    </span>
                                </div>
                            </div>

                            {summary.balance > 0 && (
                                <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                                    应收款项
                                </div>
                            )}

                            {summary.balance < 0 && (
                                <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                                    应付款项
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserSummary;