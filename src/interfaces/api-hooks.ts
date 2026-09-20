import type { ButtonProps, FormProps } from '@/components';
import type {
    BaseRecord,
    HttpError,
    SuccessErrorNotification,
    useCustom,
    useCustomMutation,
} from '@refinedev/core';

export type CustomHttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

export type FormMode = 'create' | 'edit' | 'clone';

export type ApiNotificationParam = SuccessErrorNotification['errorNotification'];

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
    TData = unknown,
    TError = unknown,
    TVariables = unknown,
> extends SuccessErrorNotification<TData, TError, TVariables> {
    resource?: string;
}

export interface IBaseApiCallbackRequest<TData = unknown> {
    onSuccess?: (data: TData) => void | Promise<void>;
    onError?: (error: HttpError) => void | Promise<void>;
}

export interface IBaseApiQueryRequest<TOptions = unknown> {
    queryOptions?: TOptions;
}

export interface IBaseApiTransformRequest<TData = unknown, TTransformed = TData> {
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

export interface IBaseApiQueryResponse<TData = unknown, TQueryData extends BaseRecord = BaseRecord>
    extends IBaseApiDataResponse<TData>, IBaseApiLoadingResponse {
    query: ReturnType<typeof useCustom<TQueryData, HttpError>>['query'];
    result: ReturnType<typeof useCustom<TQueryData, HttpError>>['result'];
}

export interface IBaseApiFormResponse<
    TVariables = Record<string, unknown>,
> extends IBaseApiLoadingResponse {
    mode: FormMode;
    resource?: string;
    formProps: FormProps<TVariables>;
    saveButtonProps: ButtonProps & { onClick: () => void };
}
