import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

const DebtSettlement = ({ users }) => {
    const [settlements, setSettlements] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (users.length > 0) {
            calculateSettlements();
        }
    }, [users]);

    const calculateSettlements = async () => {
        setLoading(true);
        try {
            // 获取所有用户的未结算净余额
            const userBalances = await Promise.all(
                users.map(async (user) => {
                    const summary = await apiService.getUnsettledSummary(user.id);
                    return {
                        id: user.id,
                        name: summary.name,
                        balance: summary.balance
                    };
                })
            );

            // 计算最优债务清算方案
            const settlements = calculateOptimalSettlements(userBalances);
            setSettlements(settlements);
        } catch (error) {
            console.error('计算债务清算失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateOptimalSettlements = (userBalances) => {
        // 分离债权人和债务人
        const creditors = userBalances.filter(user => user.balance > 0.01).sort((a, b) => b.balance - a.balance);
        const debtors = userBalances.filter(user => user.balance < -0.01).sort((a, b) => a.balance - b.balance);

        const settlements = [];
        let creditorIndex = 0;
        let debtorIndex = 0;

        while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
            const creditor = creditors[creditorIndex];
            const debtor = debtors[debtorIndex];

            const amount = Math.min(creditor.balance, Math.abs(debtor.balance));

            if (amount > 0.01) { // 只处理超过1分的金额
                settlements.push({
                    from: debtor.name,
                    to: creditor.name,
                    amount: amount
                });

                creditor.balance -= amount;
                debtor.balance += amount;
            }

            if (Math.abs(creditor.balance) < 0.01) creditorIndex++;
            if (Math.abs(debtor.balance) < 0.01) debtorIndex++;
        }

        return settlements;
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4 text-gray-800">债务清算</h2>
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#2563eb' }}></div>
                    <p className="mt-2 text-gray-500">计算中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800">债务清算建议</h2>

            {settlements.length === 0 ? (
                <div className="text-center py-8">
                    <div className="text-green-600 mb-2">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-gray-600">所有账目已平衡，无需结算！</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-gray-600 mb-4">
                        以下是最优的债务清算方案，只需 <span className="font-semibold text-blue-600">{settlements.length}</span> 笔转账即可结清所有账目：
                    </p>

                    {settlements.map((settlement, index) => (
                        <div
                            key={index}
                            className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-blue-50 to-white"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                                        {settlement.from}
                                    </div>
                                    <div className="text-gray-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </div>
                                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                        {settlement.to}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-gray-900">
                                        ${settlement.amount.toFixed(2)}
                                    </div>
                                    <div className="text-xs text-gray-500">转账金额</div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start">
                            <div className="text-yellow-600 mr-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-yellow-800 mb-1">💡 清算说明</h4>
                                <p className="text-xs text-yellow-700">
                                    完成上述转账后，所有人的账目将完全平衡。建议使用支付宝、微信或银行转账完成结算。
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DebtSettlement;