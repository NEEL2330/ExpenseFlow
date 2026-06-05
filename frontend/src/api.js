import axios from 'axios';

const api = axios.create({
  // Proxy will handle /api -> localhost:8000/api
  baseURL: '/api',
});

export const fetchTransactions = async (filters = {}) => {
  const { data } = await api.get('/transactions/', { params: filters });
  return data;
};

export const fetchAnalytics = async (filters = {}) => {
  const { data } = await api.get('/analytics/', { params: filters });
  return data;
};
