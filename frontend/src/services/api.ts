import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  getCurrentUser: () =>
    api.get('/auth/me'),
};

// Laundry API
export const laundryAPI = {
  // Admin endpoints
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    order?: string;
  }) => api.get('/laundry', { params }),
  
  getById: (id: string) =>
    api.get(`/laundry/${id}`),
  
  create: (formData: FormData) =>
    api.post('/laundry', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  update: (id: string, formData: FormData) =>
    api.put(`/laundry/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  delete: (id: string) =>
    api.delete(`/laundry/${id}`),
  
  // Public endpoints
  getPublicList: (params?: { tenantName?: string; code?: string }) =>
    api.get('/laundry/public', { params }),
  
  trackByCode: (code: string) =>
    api.get(`/laundry/track/${code}`),
};

export default api;
