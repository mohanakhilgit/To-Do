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

// Request interceptor to include the token in headers
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

// Response interceptor to handle token refresh and errors
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Check for 401 error and ensure we don't retry more than once
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await axios.post(
                        `${getApiBaseUrl()}/refresh/`,
                        { refresh: refreshToken }
                    );

                    const newAccessToken = response.data.data.access;
                    const newRefreshToken = response.data.data.refresh;
                    
                    localStorage.setItem('accessToken', newAccessToken);
                    localStorage.setItem('refreshToken', newRefreshToken);

                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                // This block runs if the /refresh/ endpoint itself fails (e.g., refresh token is also invalid)
                console.error("Token refresh failed:", refreshError);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
