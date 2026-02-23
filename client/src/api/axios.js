import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api'),
    headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('elms_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle auth errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('elms_token');
            localStorage.removeItem('elms_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
