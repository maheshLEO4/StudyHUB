/**
 * Axios API client
 * Centralises base URL, auth headers, token refresh, and error handling
 */
import axios from 'axios';
import toast from 'react-hot-toast';

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
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 → attempt refresh; on failure → redirect to login
let refreshing = false;
let queue = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (refreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then(() => api(original));
      }
      original._retry = true;
      refreshing = true;
      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        localStorage.setItem('accessToken', data.data.accessToken);
        queue.forEach(({ resolve }) => resolve());
        queue = [];
        return api(original);
      } catch {
        queue.forEach(({ reject }) => reject(error));
        queue = [];
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      } finally {
        refreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Resource helpers ──────────────────────────────────────────────────────
export const authAPI = {
  signup:  (data)           => api.post('/auth/signup', data),
  login:   (data)           => api.post('/auth/login', data),
  logout:  ()               => api.post('/auth/logout'),
  refresh: ()               => api.post('/auth/refresh'),
  getMe:   ()               => api.get('/auth/me'),
  updateMe:(data)           => api.patch('/auth/me', data),
  changePassword: (data)    => api.patch('/auth/change-password', data),
};

export const subjectsAPI = {
  getAll:      ()           => api.get('/subjects'),
  getOne:      (id)         => api.get(`/subjects/${id}`),
  create:      (data)       => api.post('/subjects', data),
  update:      (id, data)   => api.patch(`/subjects/${id}`, data),
  delete:      (id)         => api.delete(`/subjects/${id}`),
  addNote:     (id, data)   => api.post(`/subjects/${id}/notes`, data),
  updateNote:  (id, nId, d) => api.patch(`/subjects/${id}/notes/${nId}`, d),
  deleteNote:  (id, nId)    => api.delete(`/subjects/${id}/notes/${nId}`),
};

export const linksAPI = {
  getAll:  (params)       => api.get('/links', { params }),
  create:  (data)         => api.post('/links', data),
  update:  (id, data)     => api.patch(`/links/${id}`, data),
  delete:  (id)           => api.delete(`/links/${id}`),
};

export const dsaAPI = {
  getAll:  (params)       => api.get('/dsa', { params }),
  create:  (data)         => api.post('/dsa', data),
  update:  (id, data)     => api.patch(`/dsa/${id}`, data),
  delete:  (id)           => api.delete(`/dsa/${id}`),
};

export const eventsAPI = {
  getAll:  (params)       => api.get('/events', { params }),
  create:  (data)         => api.post('/events', data),
  update:  (id, data)     => api.patch(`/events/${id}`, data),
  delete:  (id)           => api.delete(`/events/${id}`),
};

export const todosAPI = {
  getChecklists:    ()          => api.get('/todos/checklists'),
  createChecklist:  (data)      => api.post('/todos/checklists', data),
  updateChecklist:  (id, data)  => api.patch(`/todos/checklists/${id}`, data),
  deleteChecklist:  (id)        => api.delete(`/todos/checklists/${id}`),
  getAll:   (params)            => api.get('/todos', { params }),
  create:   (data)              => api.post('/todos', data),
  update:   (id, data)          => api.patch(`/todos/${id}`, data),
  delete:   (id)                => api.delete(`/todos/${id}`),
};

export const searchAPI = {
  search:    (q)   => api.get('/search', { params: { q } }),
  dashboard: ()    => api.get('/search/dashboard'),
};
