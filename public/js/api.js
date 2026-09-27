
const API_BASE = '/api';

const API = {
  async request(endpoint, options = {}) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    };

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, config);
      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorMsg = data.errors ? data.errors.join(', ') : (data.error || 'Request failed');
        throw new Error(errorMsg);
      }

      return data;
    } catch (err) {
      console.error(`[API Error] ${endpoint}:`, err);
      throw err;
    }
  },


  getTransactions(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/transactions${query ? `?${query}` : ''}`);
  },

  getTransaction(id) {
    return this.request(`/transactions/${id}`);
  },

  createTransaction(transactionData) {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData)
    });
  },

  updateTransaction(id, transactionData) {
    return this.request(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transactionData)
    });
  },

  deleteTransaction(id) {
    return this.request(`/transactions/${id}`, {
      method: 'DELETE'
    });
  },

  getTransactionSummary() {
    return this.request('/transactions/summary');
  },

  getBudget(month) {
    const query = month ? `?month=${encodeURIComponent(month)}` : '';
    return this.request(`/budget${query}`);
  },

  setBudget(month, amount) {
    return this.request('/budget', {
      method: 'POST',
      body: JSON.stringify({ month, amount })
    });
  },

  getBudgetInsights(month) {
    const query = month ? `?month=${encodeURIComponent(month)}` : '';
    return this.request(`/budget/insights${query}`);
  }
};

window.API = API;
