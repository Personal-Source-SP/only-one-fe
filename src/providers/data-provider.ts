import { SERVER_IS_NOT_READY_MESSAGE } from '@/constants';
import { PaginationRequest, ApiError } from '@/interfaces';
import { CrudFilters, CrudOperators, CrudSorting, DataProvider, HttpError } from '@refinedev/core';
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { Session } from 'next-auth';
import qs from 'query-string';

const formatErrorMessage = (error: ApiError): string | null => {
    if (typeof error === 'string') {
        return error;
    }

    if (Array.isArray(error)) {
        return error.map((item) => item.message || item.code).join(', ');
    }

    return null;
};

const mapOperator = (operator: CrudOperators): string => {
    switch (operator) {
        case 'ne':
            return '$not';
        case 'gte':
        case 'eq':
        case 'lte':
            return `$${operator}`;
        case 'in':
            return '$in';
        case 'contains':
            return '$ilike';
        case 'between':
            return '$btw';
        default:
            return '';
    }
};

const generateSort = (sort?: CrudSorting): string[] => {
    if (!sort?.length) return [];
    return sort.map((item) => `${item.field}:${item.order.toUpperCase()}`);
};

const generateFilter = (filters?: CrudFilters): Record<string, string> => {
    if (!filters) return {};

    const queryFilters: Record<string, string> = filters.reduce(
        (acc, filter) => {
            if (['or', 'and'].includes(filter.operator)) {
                throw new Error(`\`operator: ${filter.operator}\` is not supported`);
            }

            if ('field' in filter) {
                const { field, operator, value } = filter;

                if (field === 'q' || field === 'search') {
                    acc[field] = value;
                } else {
                    const mappedOperator = mapOperator(operator);
                    acc[`filter.${field}`] = `${mappedOperator}:${value}`;
                }
            }
            return acc;
        },
        {} as Record<string, string>,
    );

    return queryFilters;
};

export const getSessionToken = (session: Session | null): string | undefined => {
    return session?.user?.accessToken;
};

export const createSessionAxiosInstance = (session: Session | null) => {
    const axiosInstance = axios.create();

    axiosInstance.interceptors.request.use((request: InternalAxiosRequestConfig) => {
        const token = session?.user?.accessToken;

        if (!token) return request;

        if (!request?.headers?.['Authorization']) {
            request.headers['Authorization'] = `Bearer ${token}`;
        } else {
            request.headers = {
                ...request.headers,
                Authorization: `Bearer ${token}`,
            } as InternalAxiosRequestConfig['headers'];
        }

        return request;
    });

    axiosInstance.interceptors.response.use(
        (response) => {
            return response;
        },
        async (error) => {
            const { data, status, statusText } = error.response || {};

            const statusCode = status || 408;
            const errorData = data?.message || data?.errors || data;
            const message =
                formatErrorMessage(errorData) || statusText || SERVER_IS_NOT_READY_MESSAGE;

            const customError: HttpError = {
                ...error,
                message,
                statusCode,
            };

            let isRefreshing = false;
            const originalRequest = error.config;

            if (error?.response?.status === 401 && !originalRequest?._retry) {
                if (originalRequest?.url?.includes('auth/')) {
                    isRefreshing = false;
                    return Promise.reject(customError);
                }

                if (isRefreshing) {
                    return new Promise(function (resolve, reject) {
                        resolve(null);
                    })
                        .then(() => {
                            return axios(originalRequest);
                        })
                        .catch((err) => {
                            return Promise.reject(err);
                        });
                }
            }

            return Promise.reject(customError);
        },
    );

    return axiosInstance;
};

const RestServer = (
    apiUrl: string,
    httpClient: AxiosInstance = createSessionAxiosInstance(null),
): DataProvider => ({
    getApiUrl: () => {
        return apiUrl;
    },

    getList: async ({ resource, pagination, filters, sorters }) => {
        const { currentPage = 1, pageSize = 10 } = pagination ?? {};

        const queryFilters = generateFilter(filters);
        const queryPagination: PaginationRequest = {
            page: currentPage,
            limit: pageSize,
        };

        const generatedSort = generateSort(sorters);
        if (generatedSort) queryPagination.sortBy = generatedSort;

        const url = `${apiUrl}/${resource}`;
        const { data: apiResponseData } = await httpClient.get(
            `${url}?${qs.stringify(queryPagination)}&${qs.stringify(queryFilters)}`,
        );

        return {
            data: apiResponseData.data,
            meta: apiResponseData.meta,
            extraData: apiResponseData.extraData,
            total: apiResponseData.meta?.totalItems || apiResponseData.data?.length || 0,
        };
    },

    getMany: async ({ resource, ids }) => {
        const { data } = await httpClient.get(`${apiUrl}/${resource}?${qs.stringify({ id: ids })}`);
        return { data };
    },

    create: async ({ resource, variables }) => {
        const { data } = await httpClient.post(`${apiUrl}/${resource}`, variables);
        return { data };
    },

    createMany: async ({ resource, variables }) => {
        const response = await Promise.all(
            variables.map(async (param) => {
                const { data } = await httpClient.post(`${apiUrl}/${resource}`, param);
                return data;
            }),
        );

        return { data: response };
    },

    update: async ({ resource, id, variables }) => {
        const { data } = await httpClient.put(`${apiUrl}/${resource}/${id}`, variables);
        return { data };
    },

    updateMany: async ({ resource, ids, variables }) => {
        const response = await Promise.all(
            ids.map(async (id) => {
                const { data } = await httpClient.put(`${apiUrl}/${resource}/${id}`, variables);
                return data;
            }),
        );

        return { data: response };
    },

    getOne: async ({ resource, id }) => {
        const { data } = await httpClient.get(`${apiUrl}/${resource}/${id}`);
        return { data: data.data };
    },

    deleteOne: async ({ resource, id }) => {
        const { data } = await httpClient.delete(`${apiUrl}/${resource}/${id}`);
        return { data };
    },

    deleteMany: async ({ resource, ids }) => {
        const response = await Promise.all(
            ids.map(async (id) => {
                const { data } = await httpClient.delete(`${apiUrl}/${resource}/${id}`);
                return data;
            }),
        );

        return { data: response };
    },

    custom: async ({ url, method, filters, sorters, payload, query, headers }) => {
        let requestUrl = url;
        let hasParams = false;

        if (sorters) {
            const generatedSort = generateSort(sorters);
            if (generatedSort) {
                const sortQuery = {
                    sort: generatedSort,
                };

                requestUrl += `${hasParams ? '&' : '?'}${qs.stringify(sortQuery)}`;

                hasParams = true;
            }
        }

        if (filters) {
            const filterQuery = generateFilter(filters);

            requestUrl += `${hasParams ? '&' : '?'}${qs.stringify(filterQuery)}`;

            hasParams = true;
        }

        if (query) {
            requestUrl += `${hasParams ? '&' : '?'}${qs.stringify(query)}`;

            hasParams = true;
        }

        if (headers) {
            httpClient.defaults.headers = {
                ...httpClient.defaults.headers,
                ...headers,
            } as AxiosInstance['defaults']['headers'];
        }

        let axiosResponse;
        switch (method) {
            case 'put':
            case 'post':
            case 'patch': {
                axiosResponse = await httpClient[method](requestUrl, payload);
                break;
            }
            case 'delete': {
                axiosResponse = await httpClient.delete(requestUrl, {
                    data: payload,
                });
                break;
            }
            default: {
                axiosResponse = await httpClient.get(requestUrl, {
                    responseType: (headers as { Accept?: string })?.Accept?.includes(
                        'spreadsheetml.sheet',
                    )
                        ? 'blob'
                        : 'json',
                });
                break;
            }
        }

        return Promise.resolve(axiosResponse);
    },
});

export default RestServer;
