import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

// Public endpoints that must NEVER receive an Authorization header
const PUBLIC_ENDPOINTS = ['/auth/login', '/auth/register'];

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach JWT — skip for public auth endpoints
api.interceptors.request.use(
  (config) => {
    const url = config.url || '';
    const isPublic = PUBLIC_ENDPOINTS.some(p => url.includes(p));
    if (!isPublic) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 401 handler — redirect to the correct login page
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      // Don't redirect on auth endpoints themselves
      if (!PUBLIC_ENDPOINTS.some(p => url.includes(p))) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (url.includes('/admin')) {
          window.location.href = '/admin/login';
        } else if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/admin/login';
        } else {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
