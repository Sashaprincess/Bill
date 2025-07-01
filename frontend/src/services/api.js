const API_BASE_URL = 'http://localhost:5001/api';

class ApiService {
    // 通用请求方法
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // 用户相关
    async getUsers() {
        return this.request('/users');
    }

    async createUser(name) {
        return this.request('/users', {
            method: 'POST',
            body: JSON.stringify({ name }),
        });
    }

    // 费用相关
    async getExpenses() {
        return this.request('/expenses');
    }

    async createExpense(expenseData) {
        return this.request('/expenses', {
            method: 'POST',
            body: JSON.stringify(expenseData),
        });
    }

    async getUserSummary(userId) {
        return this.request(`/expenses/summary/${userId}`);
    }

    async updateExpenseStatus(id, status) {
        return this.request(`/expenses/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    }
    // 获取未结算费用汇总
    async getUnsettledSummary(userId) {
        return this.request(`/expenses/unsettled-summary/${userId}`);
    }
}

const apiService = new ApiService();
export default apiService;