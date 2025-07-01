import React, { useState } from 'react';
import apiService from '../services/api';

const UserManager = ({ users, onUserAdded }) => {
    const [newUserName, setNewUserName] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleAddUser = async (e) => {
        e.preventDefault();

        if (!newUserName.trim()) {
            alert('请输入用户名');
            return;
        }

        setIsAdding(true);

        try {
            await apiService.createUser(newUserName.trim());
            setNewUserName('');
            onUserAdded();
            alert('用户添加成功！');
        } catch (error) {
            console.error('添加用户失败:', error);
            alert('添加用户失败，可能用户名已存在');
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">用户管理</h2>

            {/* 添加用户表单 */}
            <form onSubmit={handleAddUser} className="mb-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="输入新用户名"
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isAdding}
                    />
                    <button
                        type="submit"
                        disabled={isAdding}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                    >
                        {isAdding ? '添加中...' : '添加用户'}
                    </button>
                </div>
            </form>

            {/* 用户列表 */}
            <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">当前用户</h3>
                <div className="flex flex-wrap gap-2">
                    {users.map(user => (
                        <span
                            key={user.id}
                            className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                        >
                            {user.name}
                        </span>
                    ))}
                </div>
                {users.length === 0 && (
                    <p className="text-gray-500 text-sm">暂无用户</p>
                )}
            </div>
        </div>
    );
};

export default UserManager;