import axios from 'axios';

const instance = axios.create({
  baseURL: '/api',
});

// Request interceptor — inject JWT token if present
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('scrapbridge_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — clear token on 401 (ProtectedRoute handles redirect)
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('scrapbridge_token');
    }
    return Promise.reject(error);
  }
);

export default instance;
