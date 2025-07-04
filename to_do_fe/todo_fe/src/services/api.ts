import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Get environment variable with fallback
const getApiBaseUrl = (): string => {
    return (window as any).env?.REACT_APP_API_BASE_URL || 
    import.meta.env?.VITE_API_BASE_URL || 
    'http://127.0.0.1:8000/api';
};

// Create an instance of axios
const apiClient: AxiosInstance = axios.create({
    baseURL: getApiBaseUrl(),
    timeout: 10000, // 10 seconds
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the token in headers
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle token refresh and errors
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
            // Attempt to refresh the token
            const response = await axios.post(
                `${getApiBaseUrl()}/refresh/`,
                { refresh: refreshToken }
            );

            const newAccessToken = response.data.access;
            localStorage.setItem('accessToken', newAccessToken);

            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return apiClient(originalRequest);
            }
        } catch (refreshError) {
            // Refresh failed, redirect to login
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return Promise.reject(refreshError);
        }
        }

        if (error.response?.status === 401) {
            // Clear tokens and redirect to login
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default apiClient;