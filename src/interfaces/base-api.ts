export type SortBy<T> = [keyof T & string, 'ASC' | 'DESC'][];
export type Column<T> = keyof T & string;

export namespace NBaseApi {
    export interface IRequest {
        baseURL: string;
        timeout?: number;
        accessToken?: string;
        withCredentials?: boolean;
    }

    export interface IResponse<T> {
        data: T | null;
        status?: number;
        errorMessage?: string;
    }

    export interface IPaginationResponse<T> {
        data: T[];
        meta: {
            itemsPerPage: number;
            totalItems?: number;
            currentPage?: number;
            totalPages?: number;
            sortBy: SortBy<T>;
            searchBy: Column<T>[];
            search: string;
            select: string[];
            filter?: {
                [column: string]: string | string[];
            };
            cursor?: string;
        };
        links: {
            first?: string;
            previous?: string;
            current: string;
            next?: string;
            last?: string;
        };
    }

    export interface IGetRequest {
        endPoint: string;
        params?: URLSearchParams;
        headers?: Record<string, string>;
    }

    export interface IDeleteRequest {
        endPoint: string;
        params?: URLSearchParams;
        headers?: Record<string, string>;
    }

    export interface IPostRequest {
        endPoint: string;
        data: Record<string, any>;
        params?: URLSearchParams;
        headers?: Record<string, string>;
    }

    export interface IPutRequest {
        endPoint: string;
        data: Record<string, any>;
        params?: URLSearchParams;
        headers?: Record<string, string>;
    }

    export interface IPatchRequest {
        endPoint: string;
        data: Record<string, any>;
        params?: URLSearchParams;
        headers?: Record<string, string>;
    }
}
