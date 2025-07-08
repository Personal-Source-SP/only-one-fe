// lib/axios.ts
import axios, { AxiosError, AxiosResponse } from 'axios';

// Tạo axios instance
export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
    timeout: 30000, // 30 seconds
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        // Log request trong development
        if (process.env.NODE_ENV === 'development') {
            console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
        }

        // Thêm auth token nếu có
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    },
);

// Response interceptor
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        // Log response trong development
        if (process.env.NODE_ENV === 'development') {
            console.log(
                `✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`,
            );
        }
        return response;
    },
    (error: AxiosError) => {
        // Log error
        if (process.env.NODE_ENV === 'development') {
            console.error(
                `❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status}`,
            );
        }

        // Handle common errors
        if (error.response?.status === 401) {
            // Unauthorized - redirect to login or refresh token
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                // window.location.href = '/login';
            }
        } else if (error?.response?.status && error.response.status >= 500) {
            // Server errors
            console.error('Server Error:', error.response?.data);
        }

        return Promise.reject(error);
    },
);

// Helper function để handle axios errors
export const handleAxiosError = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string; error?: string }>;

        // Nếu có response từ server
        if (axiosError.response?.data) {
            const data = axiosError.response.data;
            return data.message || data.error || 'Có lỗi xảy ra từ server';
        }

        // Nếu là network error
        if (axiosError.code === 'NETWORK_ERROR') {
            return 'Lỗi kết nối mạng';
        }

        // Nếu là timeout
        if (axiosError.code === 'ECONNABORTED') {
            return 'Yêu cầu quá thời gian chờ';
        }

        return axiosError.message || 'Có lỗi xảy ra';
    }

    return 'Có lỗi không xác định xảy ra';
};

export default apiClient;
