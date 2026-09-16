import type { BaseRecord, HttpError, OpenNotificationParams } from '@refinedev/core';

export type CustomHttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

export type FormMode = 'create' | 'edit' | 'clone';

export type ApiNotificationCallback<T = any> = (
    dataOrError?: T,
    values?: any,
    resource?: string,
) => OpenNotificationParams | false | undefined | any;

export type ApiNotificationParam = OpenNotificationParams | false | ApiNotificationCallback;

export type InitialValuesMapper<TQueryFnData extends BaseRecord, TVariables> = (
    data: TQueryFnData,
) => Partial<TVariables>;

export interface IBaseApiNotificationRequest {
    resource?: string;
    errorMessage?: string;
    successMessage?: string;
    errorDescription?: string;
    successDescription?: string;
    errorNotification?: ApiNotificationParam;
    successNotification?: ApiNotificationParam;
}

export interface IBaseApiCallbackRequest<TData = any> {
    onSuccess?: (data: TData) => void | Promise<void>;
    onError?: (error: HttpError) => void | Promise<void>;
}

export interface IBaseApiUrlRequest {
    url: string;
}

export interface IBaseApiQueryRequest<TOptions = any> {
    enabled?: boolean;
    refetchInterval?: number | false;
    queryOptions?: TOptions;
}

export interface IBaseApiTransformRequest<TData = any, TTransformed = TData> {
    transform?: (data: TData | undefined, rawResponse?: any) => TTransformed;
}
