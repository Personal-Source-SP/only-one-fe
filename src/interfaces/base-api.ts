export interface IAbstract {
    id: string;
    createdAt?: Date;
    createdBy?: string | null;
    updatedBy?: string | null;
    updatedAt?: Date;
    deletedBy?: string | null;
    deletedAt?: Date | null;
}

export interface IPaginationRequest {
    page?: number;
    limit?: number;
    filter?: string;
    sortBy?: string[];
}

export interface IErrorItem {
    code: string;
    message?: string;
}

export type ApiError = string | IErrorItem | IErrorItem[];

export interface IBaseApiRequest {
    baseURL: string;
    timeout?: number;
    accessToken?: string;
    withCredentials?: boolean;
}

export interface IBaseApiResponse<T> {
    data: T | null;
    status?: number;
    errorMessage?: string;
}

export interface IBaseApiGetRequest {
    endPoint: string;
    params?: URLSearchParams;
    headers?: Record<string, string>;
}

export interface IBaseApiDeleteRequest {
    endPoint: string;
    params?: URLSearchParams;
    headers?: Record<string, string>;
}

export interface IBaseApiPostRequest {
    endPoint: string;
    data: Record<string, unknown>;
    params?: URLSearchParams;
    headers?: Record<string, string>;
}

export interface IBaseApiPutRequest {
    endPoint: string;
    data: Record<string, unknown>;
    params?: URLSearchParams;
    headers?: Record<string, string>;
}

export interface IBaseApiPatchRequest {
    endPoint: string;
    data: Record<string, unknown>;
    params?: URLSearchParams;
    headers?: Record<string, string>;
}
