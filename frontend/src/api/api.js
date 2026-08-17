/**
 * StorePilot API client — thin fetch wrapper with auth handling.
 * All API calls go through here.
 */

const BASE = import.meta.env.VITE_API_URL || '';

function getToken() {
  return localStorage.getItem('storepilot-token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('storepilot-token');
    if (!path.includes('/auth/')) {
      window.location.href = '/login';
    }
    throw new Error('Authentication required');
  }

  if (res.status === 204) return null;

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail || err.error?.message || 'Request failed');
  }

  return res.json();
}

const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};

// Auth
export const authAPI = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  me: () => api.get('/api/auth/me'),
};

// Products
export const productsAPI = {
  list: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v != null && v !== '') qs.set(k, v); });
    return api.get(`/api/products?${qs}`);
  },
  get: (id) => api.get(`/api/products/${id}`),
  create: (data) => api.post('/api/products', data),
  update: (id, data) => api.put(`/api/products/${id}`, data),
  delete: (id) => api.delete(`/api/products/${id}`),
};

// Categories
export const categoriesAPI = {
  list: () => api.get('/api/categories'),
  create: (data) => api.post('/api/categories', data),
};

// Suppliers
export const suppliersAPI = {
  list: () => api.get('/api/suppliers'),
  get: (id) => api.get(`/api/suppliers/${id}`),
  create: (data) => api.post('/api/suppliers', data),
  update: (id, data) => api.put(`/api/suppliers/${id}`, data),
  delete: (id) => api.delete(`/api/suppliers/${id}`),
};

// Customers
export const customersAPI = {
  list: () => api.get('/api/customers'),
  create: (data) => api.post('/api/customers', data),
};

// Sales
export const salesAPI = {
  list: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v != null && v !== '') qs.set(k, v); });
    return api.get(`/api/sales?${qs}`);
  },
  get: (id) => api.get(`/api/sales/${id}`),
  create: (data) => api.post('/api/sales', data),
};

// Purchases
export const purchasesAPI = {
  list: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v != null && v !== '') qs.set(k, v); });
    return api.get(`/api/purchases?${qs}`);
  },
  get: (id) => api.get(`/api/purchases/${id}`),
  create: (data) => api.post('/api/purchases', data),
};

// Inventory
export const inventoryAPI = {
  overview: () => api.get('/api/inventory/overview'),
  lowStock: () => api.get('/api/inventory/low-stock'),
  history: (productId) => api.get(`/api/inventory/history${productId ? `?product_id=${productId}` : ''}`),
  adjust: (data) => api.post('/api/inventory/adjust', data),
};

// Dashboard
export const dashboardAPI = {
  get: (period = '30d') => api.get(`/api/dashboard?period=${period}`),
};

// Reports
export const reportsAPI = {
  sales: (params = {}) => {
    const qs = new URLSearchParams(params);
    return api.get(`/api/reports/sales?${qs}`);
  },
  products: (params = {}) => {
    const qs = new URLSearchParams(params);
    return api.get(`/api/reports/products?${qs}`);
  },
  inventory: () => api.get('/api/reports/inventory'),
  purchases: (params = {}) => {
    const qs = new URLSearchParams(params);
    return api.get(`/api/reports/purchases?${qs}`);
  },
  profit: (params = {}) => {
    const qs = new URLSearchParams(params);
    return api.get(`/api/reports/profit?${qs}`);
  },
};

// Notifications
export const notificationsAPI = {
  list: () => api.get('/api/notifications'),
  unreadCount: () => api.get('/api/notifications/unread-count'),
  markRead: (id) => api.put(`/api/notifications/${id}/read`),
  markAllRead: () => api.put('/api/notifications/read-all'),
};

// AI
export const aiAPI = {
  status: () => api.get('/api/ai/status'),
  chat: (message) => api.post('/api/ai/chat', { message }),
  healthScore: () => api.get('/api/ai/health-score'),
  executiveSummary: () => api.get('/api/ai/executive-summary'),
  explainChart: (chartType, chartData) => api.post('/api/ai/explain-chart', { chart_type: chartType, chart_data: chartData }),
  recommendations: () => api.get('/api/ai/recommendations'),
};

// Search
export const searchAPI = {
  query: (q) => api.get(`/api/search?q=${encodeURIComponent(q)}`),
};

export default api;
