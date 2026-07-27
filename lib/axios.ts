import axios from 'axios';

// ── Base URL ──────────────────────────────────────────────────────────────
// NEXT_PUBLIC_API_URL is set in .env.local
// Browser (web): http://localhost:8000
// Mobile APK:    must be laptop WiFi IP e.g. http://10.79.179.109:8000
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000, // 12s — allows for FastAPI cold start and slow campus WiFi
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401, surface real errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only log real HTTP errors (with a status code), not network/connection errors
    if (process.env.NODE_ENV !== 'production' && error.response?.status) {
      console.error('[API Error]', error.response.status, error.config?.url);
    }

    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
    }

    // Always reject so callers can catch the real error
    return Promise.reject(error);
  }
);

export default apiClient;
export { API_BASE_URL };
