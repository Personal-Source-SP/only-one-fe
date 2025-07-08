export declare namespace NBaseApi {
    interface IRequest {
        baseURL: string;
        timeout?: number;
        accessToken?: string;
        withCredentials?: boolean;
    }

    interface IResponse<T> {
        data: T | null;
        status?: number;
        errorMessage?: string;
    }

    interface IGetRequest {
        endPoint: string;
        params?: URLSearchParams;
        headers?: Record<string, string>;
    }

    interface IDeleteRequest {
        endPoint: string;
        params?: URLSearchParams;
        headers?: Record<string, string>;
    }

    interface IPostRequest {
        endPoint: string;
        data: Record<string, any>;
        params?: URLSearchParams;
        headers?: Record<string, string>;
    }

    interface IPutRequest {
        endPoint: string;
        data: Record<string, any>;
        params?: URLSearchParams;
        headers?: Record<string, string>;
    }

    interface IPatchRequest {
        endPoint: string;
        data: Record<string, any>;
        params?: URLSearchParams;
        headers?: Record<string, string>;
    }
}
