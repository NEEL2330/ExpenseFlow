import axios from 'axios';

const api = axios.create({
  // Proxy will handle /api -> localhost:8000/api
  baseURL: '/api',
});

// Read from environment – set VITE_DEFAULT_USER_ID in .env
const DEFAULT_USER_ID = import.meta.env.VITE_DEFAULT_USER_ID || '8';

export const fetchTransactions = async (filters = {}) => {
  const { data } = await api.get('/transactions/', { params: { user_id: DEFAULT_USER_ID, ...filters } });
  return data;
};

export const fetchAnalytics = async (filters = {}) => {
  const { data } = await api.get('/analytics/', { params: { user_id: DEFAULT_USER_ID, ...filters } });
  return data;
};

// Fetch analytics for today only
export const fetchTodayAnalytics = async () => {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await api.get('/analytics/', { params: { user_id: DEFAULT_USER_ID, from: today, to: today } });
  return data;
};

// Fetch analytics for a specific month (YYYY-MM string)
export const fetchMonthAnalytics = async (yearMonth) => {
  const [year, month] = yearMonth.split('-').map(Number);
  const from = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
  const { data } = await api.get('/analytics/', { params: { user_id: DEFAULT_USER_ID, from, to } });
  return data;
};
