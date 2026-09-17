import type { ButtonProps, FormProps } from '@/components/custom-antd';
import type {
    BaseRecord,
    HttpError,
    OpenNotificationParams,
    SuccessErrorNotification,
    useCustom,
    useCustomMutation,
} from '@refinedev/core';

export type CustomHttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

export type FormMode = 'create' | 'edit' | 'clone';

export type NotificationCallback<T = any> = (
    dataOrError?: T,
    values?: any,
    resource?: string,
) => OpenNotificationParams | false | undefined;

export type ApiNotificationParam = SuccessErrorNotification<any, any, any>['errorNotification'];

export type InitialValuesMapper<TQueryFnData extends BaseRecord, TVariables> = (
    data: TQueryFnData,
) => Partial<TVariables>;

export interface IBaseApiUrlRequest {
    url: string;
}

export interface IBaseApiResourceRequest {
    resource?: string;
}

export interface IBaseApiNotificationRequest<
    TData = any,
    TError = any,
    TVariables = any,
> extends SuccessErrorNotification<TData, TError, TVariables> {
    resource?: string;
    errorMessage?: string;
    successMessage?: string;
    errorDescription?: string;
    successDescription?: string;
}

export interface IBaseApiCallbackRequest<TData = any> {
    onSuccess?: (data: TData) => void | Promise<void>;
    onError?: (error: HttpError) => void | Promise<void>;
}

export interface IBaseApiQueryRequest<TOptions = any> {
    enabled?: boolean;
    refetchInterval?: number | false;
    queryOptions?: TOptions;
}

export interface IBaseApiTransformRequest<TData = any, TTransformed = TData> {
    transform?: (data: TData | undefined, rawResponse?: unknown) => TTransformed;
}

export interface IBaseApiFormRequest<TQueryFnData extends BaseRecord, TVariables> {
    formProps?: FormProps<TVariables>;
    initialValuesMapper?: InitialValuesMapper<TQueryFnData, TVariables>;
    onFinish?: (
        values: TVariables,
    ) => Promise<TVariables | FormData | void> | TVariables | FormData | void;
}

export interface IBaseApiUrlResponse {
    apiUrl: string;
}

export interface IBaseApiDataResponse<TData = unknown> {
    data: TData | undefined;
}

export interface IBaseApiLoadingResponse {
    isLoading: boolean;
}

export interface IBaseApiMutationResponse<
    TData extends BaseRecord = BaseRecord,
    TPayload = unknown,
> extends IBaseApiLoadingResponse {
    mutation: ReturnType<typeof useCustomMutation<TData, HttpError, TPayload>>;
}

export interface IBaseApiQueryResponse<
    TData = unknown,
    TQueryData extends BaseRecord = BaseRecord,
> extends IBaseApiDataResponse<TData> {
    query: ReturnType<typeof useCustom<TQueryData, HttpError>>['query'];
    result: ReturnType<typeof useCustom<TQueryData, HttpError>>['result'];
}

export interface IBaseApiFormResponse<TVariables = Record<string, unknown>> {
    mode: FormMode;
    resource?: string;
    formProps: FormProps<TVariables>;
    saveButtonProps: ButtonProps & { onClick: () => void };
}
