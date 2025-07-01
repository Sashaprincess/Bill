import React, { useState, useEffect } from 'react';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import UserSummary from './components/UserSummary';
import UserManager from './components/UserManager';
import apiService from './services/api';
import DebtSettlement from './components/DebtSettlement';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('expenses');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadExpenses(),
        loadUsers()
      ]);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExpenses = async () => {
    try {
      const expensesData = await apiService.getExpenses();
      setExpenses(expensesData);
    } catch (error) {
      console.error('加载费用记录失败:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const usersData = await apiService.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('加载用户数据失败:', error);
    }
  };

  const handleExpenseAdded = () => {
    loadExpenses();
  };

  const handleExpenseUpdated = () => {
    loadExpenses();
    loadUsers(); // 重新加载用户汇总
  };

  const handleUserAdded = () => {
    loadUsers();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">费用记录系统</h1>
          <p className="text-gray-600">团队费用管理与分摊</p>
        </header>

        {/* 标签页导航 */}
        <div className="mb-6">
          <nav className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${activeTab === 'expenses'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              费用记录
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${activeTab === 'summary'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              账单汇总
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${activeTab === 'users'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              用户管理
            </button>
            <button
              onClick={() => setActiveTab('settlement')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${activeTab === 'settlement'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              债务清算
            </button>
          </nav>
        </div>

        {/* 内容区域 */}
        <div className="space-y-6">
          {activeTab === 'expenses' && (
            <>
              <ExpenseForm onExpenseAdded={handleExpenseAdded} />
              <ExpenseList
                expenses={expenses}
                onExpenseUpdated={handleExpenseUpdated}
              />
            </>
          )}

          {activeTab === 'summary' && (
            <UserSummary users={users} expenses={expenses} />
          )}

          {activeTab === 'users' && (
            <UserManager users={users} onUserAdded={handleUserAdded} />
          )}
          {activeTab === 'settlement' && (
            <DebtSettlement users={users} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;