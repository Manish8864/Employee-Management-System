import axios from 'axios';

// IMPORTANT:
// In production (Render), we must explicitly point to the BACKEND host.
// If VITE_API_BASE_URL is not set, defaulting to `/api` will hit the FRONTEND domain and cause 404.
const apiBaseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: apiBaseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;


