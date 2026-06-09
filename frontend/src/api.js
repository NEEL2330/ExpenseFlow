import axios from 'axios';

const api = axios.create({
  // Proxy will handle /api -> localhost:8000/api
  baseURL: '/api',
});

// Add interceptor to include JWT token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// -- Auth Endpoints --

export const loginUser = async (username, password) => {
  const { data } = await api.post('/auth/login', { username, password });
  return data;
};

export const generateLinkToken = async () => {
  const { data } = await api.post('/auth/generate-link-token');
  return data;
};

export const checkLinkStatus = async (token) => {
  const { data } = await api.get(`/auth/check-link-status/${token}`);
  return data;
};

export const registerUser = async (userData) => {
  const { data } = await api.post('/auth/register', userData);
  return data;
};

// -- Data Endpoints --

export const fetchTransactions = async (filters = {}) => {
  const { data } = await api.get('/transactions/', { params: filters });
  return data;
};

export const fetchAnalytics = async (filters = {}) => {
  const { data } = await api.get('/analytics/', { params: filters });
  return data;
};

// Fetch analytics for today only
export const fetchTodayAnalytics = async () => {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await api.get('/analytics/', { params: { from: today, to: today } });
  return data;
};

// Fetch analytics for a specific month (YYYY-MM string)
export const fetchMonthAnalytics = async (yearMonth) => {
  const [year, month] = yearMonth.split('-').map(Number);
  const from = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
  const { data } = await api.get('/analytics/', { params: { from, to } });
  return data;
};

// Create a new transaction
export const createTransaction = async (transactionData) => {
  const { data } = await api.post('/transactions/', transactionData);
  return data;
};
