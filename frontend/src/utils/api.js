// ============================================================
// Axios API Instance + Interceptors
// ============================================================
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL, timeout: 15000 });

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('studyhub_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err)
);

// Handle 401 → redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('studyhub_token');
      localStorage.removeItem('studyhub_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ─────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
};

// ── Subjects ──────────────────────────────────────────────
export const subjectsAPI = {
  getAll: () => api.get('/subjects'),
  getOne: (id) => api.get(`/subjects/${id}`),
  create: (data) => api.post('/subjects', data),
  update: (id, d) => api.put(`/subjects/${id}`, d),
  delete: (id) => api.delete(`/subjects/${id}`),
};

// ── Notes ─────────────────────────────────────────────────
export const notesAPI = {
  getAll: (params) => api.get('/notes', { params }),
  getOne: (id) => api.get(`/notes/${id}`),
  create: (data) => api.post('/notes', data),
  update: (id, d) => api.put(`/notes/${id}`, d),
  delete: (id) => api.delete(`/notes/${id}`),
  uploadFile: (formData) => api.post('/notes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// ── Tasks ─────────────────────────────────────────────────
export const tasksAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  create: (data) => api.post('/tasks', data),
  update: (id, d) => api.put(`/tasks/${id}`, d),
  delete: (id) => api.delete(`/tasks/${id}`),
  toggle: (id) => api.patch(`/tasks/${id}/toggle`),
};

// ── Links ─────────────────────────────────────────────────
export const linksAPI = {
  getAll: (params) => api.get('/links', { params }),
  create: (data) => api.post('/links', data),
  update: (id, d) => api.put(`/links/${id}`, d),
  delete: (id) => api.delete(`/links/${id}`),
};

// ── DSA ───────────────────────────────────────────────────
export const dsaAPI = {
  getAll: (params) => api.get('/dsa', { params }),
  getStats: () => api.get('/dsa/stats'),
  create: (data) => api.post('/dsa', data),
  update: (id, d) => api.put(`/dsa/${id}`, d),
  delete: (id) => api.delete(`/dsa/${id}`),
};

// ── Calendar ──────────────────────────────────────────────
export const calendarAPI = {
  getAll: (params) => api.get('/calendar', { params }),
  getUpcoming: (limit) => api.get('/calendar/upcoming', { params: { limit } }),
  create: (data) => api.post('/calendar', data),
  update: (id, d) => api.put(`/calendar/${id}`, d),
  delete: (id) => api.delete(`/calendar/${id}`),
};

// ── Search ────────────────────────────────────────────────
export const searchAPI = {
  search: (q) => api.get('/search', { params: { q } }),
};

// ── Habits ────────────────────────────────────────────────
export const habitsAPI = {
  getAll: () => api.get('/habits'),
  create: (data) => api.post('/habits', data),
  toggle: (id) => api.put(`/habits/${id}/toggle`),
  update: (id, d) => api.put(`/habits/${id}`, d),
  delete: (id) => api.delete(`/habits/${id}`),
};

export default api;
