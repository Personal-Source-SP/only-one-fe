import { KEY_LOCAL_STORAGE, KEY_SESSION_STORAGE } from '@/constants';
import { NBaseApi } from '@/interfaces';
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { isEmpty } from 'lodash';

export class BaseApi {
    private httpClient: AxiosInstance;

    constructor(request: NBaseApi.IRequest) {
        const { baseURL, timeout, withCredentials, accessToken } = request;

        this.httpClient = axios.create({
            baseURL,
            timeout: timeout || 60 * 1000,
            withCredentials: withCredentials || false,
        });

        // Init interceptors
        this.httpClient.interceptors.request = axios.interceptors.request;

        // Request interceptor
        this.httpClient.interceptors.request.use((request) => {
            // Always try to read latest token from storage on client
            let runtimeToken: string | null = null;
            if (typeof window !== 'undefined') {
                runtimeToken = localStorage.getItem(KEY_LOCAL_STORAGE.GOOGLE_ACCESS_TOKEN) || null;
            }

            const bearer = runtimeToken || accessToken;
            if (request.headers && !request.headers['Authorization'] && bearer) {
                request.headers['Authorization'] = `Bearer ${bearer}`;
            }

            return request;
        });

        // Response interceptor
        const devMode = process.env.NODE_ENV === 'development';
        this.httpClient.interceptors.response.use(
            (response: AxiosResponse) => {
                // Log response trong development
                if (devMode) {
                    console.log(
                        `✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`,
                    );
                }

                return response;
            },
            (error: AxiosError) => {
                // Log error
                if (devMode) {
                    console.error(
                        `❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status}`,
                    );
                }

                // Unauthorized - redirect to login or refresh token
                if (error.response?.status === 401) {
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem('token');
                        localStorage.removeItem('google_token');

                        const currentPath = window.location.pathname;
                        if (currentPath !== '/login' && !currentPath.startsWith('/login')) {
                            sessionStorage.setItem(KEY_SESSION_STORAGE.RETURN_URL, currentPath);
                        }

                        window.location.href = '/login';
                    }
                }

                // Server errors
                if (error?.response?.status && error.response.status >= 500) {
                    console.error('Server Error:', error.response?.data);
                }

                return Promise.reject(error);
            },
        );
    }

    async get<T>(request: NBaseApi.IGetRequest): Promise<NBaseApi.IResponse<T | null>> {
        const { endPoint, params, headers } = request;

        return this.httpClient
            .get<T>(endPoint, { params, headers })
            .then((response: AxiosResponse<any>) => {
                if (response.status !== 200) {
                    return {
                        data: null,
                        status: response.status,
                    };
                }

                return { data: response.data.data as T, status: 200 };
            })
            .catch((error: AxiosError<T>) => {
                console.log(`API Error - ${endPoint}: ${error.message}`);

                return {
                    data: null,
                    status: error.response?.status || 500,
                    errorMessage: error.message || 'Có lỗi xảy ra',
                };
            });
    }

    async delete<T>(request: NBaseApi.IDeleteRequest): Promise<NBaseApi.IResponse<T | null>> {
        const { endPoint, params, headers } = request;

        return this.httpClient
            .delete<T>(endPoint, { params, headers })
            .then((response: AxiosResponse<any>) => {
                if (response.status !== 200) {
                    return {
                        data: null,
                        status: response.status,
                    };
                }

                return { data: response.data.data as T, status: 200 };
            })
            .catch((error: AxiosError<T>) => {
                console.log(`API Error - ${endPoint}: ${error.message}`);

                return {
                    data: null,
                    status: error.response?.status || 500,
                    errorMessage: error.message || 'Có lỗi xảy ra',
                };
            });
    }

    async post<T>(request: NBaseApi.IPostRequest): Promise<NBaseApi.IResponse<T | null>> {
        const { endPoint, data, params, headers } = request;

        return this.httpClient
            .post<T>(endPoint, data, { params, headers })
            .then((response: AxiosResponse<any>) => {
                if (response.status !== 200) {
                    return {
                        data: null,
                        status: response.status,
                    };
                }

                return { data: response.data.data as T, status: 200 };
            })
            .catch((error: AxiosError<T>) => {
                console.log(`API Error - ${endPoint}: ${error.message}`);

                return {
                    data: null,
                    status: error.response?.status || 500,
                    errorMessage: error.message || 'Có lỗi xảy ra',
                };
            });
    }

    async put<T>(request: NBaseApi.IPutRequest): Promise<NBaseApi.IResponse<T | null>> {
        const { endPoint, data, params, headers } = request;

        return this.httpClient
            .put<T>(endPoint, data, { params })
            .then((response: AxiosResponse<any>) => {
                if (response.status !== 200) {
                    return {
                        data: null,
                        status: response.status,
                    };
                }

                return { data: response.data.data as T, status: 200 };
            })
            .catch((error: AxiosError<T>) => {
                console.log(`API Error - ${endPoint}: ${error.message}`);

                return {
                    data: null,
                    status: error.response?.status || 500,
                    errorMessage: error.message || 'Có lỗi xảy ra',
                };
            });
    }

    async patch<T>(request: NBaseApi.IPatchRequest): Promise<NBaseApi.IResponse<T | null>> {
        const { endPoint, data, params, headers } = request;

        return this.httpClient
            .patch<T>(endPoint, data, { params, headers })
            .then((response: AxiosResponse<any>) => {
                if (response.status !== 200) {
                    return {
                        data: null,
                        status: response.status,
                    };
                }

                return { data: response.data.data as T, status: 200 };
            })
            .catch((error: AxiosError<T>) => {
                console.log(`API Error - ${endPoint}: ${error.message}`);

                return {
                    data: null,
                    status: error.response?.status || 500,
                    errorMessage: error.message || 'Có lỗi xảy ra',
                };
            });
    }

    generateFormData(data: Record<string, any>): FormData {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (!value) return;

            if (Array.isArray(value)) {
                value.forEach((item) => {
                    formData.append(key, item);
                });
            } else {
                formData.append(key, value);
            }
        });

        return formData;
    }

    generateSearchParams(params?: Record<string, any>): URLSearchParams {
        const urlParams = new URLSearchParams();

        if (isEmpty(params)) return urlParams;

        Object.entries(params).forEach(([key, value]) => {
            if (!value) return;

            if (Array.isArray(value)) {
                value.forEach((item) => {
                    urlParams.append(key, item);
                });
            } else {
                urlParams.append(key, value);
            }
        });

        return urlParams;
    }

    generateQueryString = (params?: Record<string, any>): string => {
        if (isEmpty(params)) return '';

        return this.generateSearchParams(params).toString();
    };

    handleAxiosError(error: unknown): string {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<{ message?: string; error?: string }>;

            // Nếu có response từ server
            if (axiosError?.response?.data) {
                const data = axiosError?.response?.data;
                return data?.message || data?.error || 'Có lỗi xảy ra từ server';
            }

            switch (axiosError?.code) {
                case 'NETWORK_ERROR':
                    return 'Lỗi kết nối mạng';
                case 'ECONNABORTED':
                    return 'Yêu cầu quá thời gian chờ';
                default:
                    return axiosError?.message || 'Có lỗi xảy ra';
            }
        }

        return 'Có lỗi không xác định xảy ra';
    }
}
