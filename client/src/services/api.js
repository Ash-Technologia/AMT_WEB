import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    withCredentials: true,
});

// ─── Request Interceptor — Attach JWT ─────────────────────────────────────────
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('amt_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// ─── Response Interceptor — Handle 401 ───────────────────────────────────────
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('amt_token');
            localStorage.removeItem('amt_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default API;
