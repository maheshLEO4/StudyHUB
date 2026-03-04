/**
 * Axios API client
 * Centralises base URL, auth headers, token refresh, and error handling
 */
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach access token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && token !== 'undefined') config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 → redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Resource helpers ──────────────────────────────────────────────────────
export const authAPI = {
  signup: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateMe: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
};

export const subjectsAPI = {
  getAll: () => api.get('/subjects'),
  getOne: (id) => api.get(`/subjects/${id}`),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
  addNote: (sId, data) => api.post('/notes', { ...data, subject: sId }),
  updateNote: (sId, nId, d) => api.put(`/notes/${nId}`, d),
  deleteNote: (sId, nId) => api.delete(`/notes/${nId}`),
};

export const linksAPI = {
  getAll: (params) => api.get('/links', { params }),
  create: (data) => api.post('/links', data),
  update: (id, data) => api.put(`/links/${id}`, data),
  delete: (id) => api.delete(`/links/${id}`),
};

export const dsaAPI = {
  getAll: (params) => api.get('/dsa', { params }),
  create: (data) => api.post('/dsa', data),
  update: (id, data) => api.put(`/dsa/${id}`, data),
  delete: (id) => api.delete(`/dsa/${id}`),
};

export const eventsAPI = {
  getAll: (params) => api.get('/calendar', { params }),
  create: (data) => api.post('/calendar', data),
  update: (id, data) => api.put(`/calendar/${id}`, data),
  delete: (id) => api.delete(`/calendar/${id}`),
};

export const todosAPI = {
  getChecklists: () => api.get('/tasks/checklists'),
  createChecklist: (data) => api.post('/tasks/checklists', data),
  updateChecklist: (id, data) => api.put(`/tasks/checklists/${id}`, data),
  deleteChecklist: (id) => api.delete(`/tasks/checklists/${id}`),
  getAll: (params) => api.get('/tasks', { params }),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
};

export const searchAPI = {
  search: (q) => api.get('/search', { params: { q } }),
  dashboard: () => api.get('/search/dashboard'),
};

export const habitsAPI = {
  getAll: () => api.get('/habits'),
  create: (data) => api.post('/habits', data),
  toggle: (id) => api.put(`/habits/${id}/toggle`),
  update: (id, data) => api.put(`/habits/${id}`, data),
  delete: (id) => api.delete(`/habits/${id}`),
};
