import {
    getMethodNotificationAction,
    resolveApiUrl,
    resolveMutationNotifications,
} from '@/utilities';
import type { BaseRecord, HttpError } from '@refinedev/core';
import { useApiUrl, useCustomMutation } from '@refinedev/core';
import type {
    CustomHttpMethod,
    IBaseApiCallbackRequest,
    IBaseApiNotificationRequest,
    IBaseApiUrlRequest,
} from '@/interfaces';

export type CustomMutationMethod = Extract<CustomHttpMethod, 'post' | 'put' | 'delete' | 'patch'>;

export interface CustomMutationDataRequest<TPayload = any, TData extends BaseRecord = BaseRecord>
    extends IBaseApiUrlRequest, IBaseApiNotificationRequest, IBaseApiCallbackRequest<TData> {
    values?: TPayload;
    method?: CustomMutationMethod;
}

export interface UseCustomMutationDataRequest<TData extends BaseRecord = BaseRecord>
    extends IBaseApiNotificationRequest, IBaseApiCallbackRequest<TData> {
    method?: CustomMutationMethod;
}

export interface UseCustomMutationDataResponse<TData extends BaseRecord, TPayload> {
    apiUrl: string;
    isLoading: boolean;
    mutation: ReturnType<typeof useCustomMutation<TData, HttpError, TPayload>>;
    handleCustomMutationData: (
        request: CustomMutationDataRequest<TPayload, TData>,
    ) => Promise<TData>;
}

export const useCustomMutationData = <
    TData extends BaseRecord = any,
    TPayload = Record<string, any>,
>({
    resource,
    method: defaultMethod = 'post',
    errorMessage,
    errorNotification,
    successMessage,
    successNotification,
    onSuccess,
    onError,
}: UseCustomMutationDataRequest<TData> = {}): UseCustomMutationDataResponse<TData, TPayload> => {
    const apiUrl = useApiUrl();
    const mutation = useCustomMutation<TData, HttpError, TPayload>();

    const handleCustomMutationData = async ({
        url,
        values,
        method = defaultMethod,
        onError: requestOnError,
        errorMessage: requestErrorMessage,
        errorNotification: requestErrorNotification,
        onSuccess: requestOnSuccess,
        successMessage: requestSuccessMessage,
        successNotification: requestSuccessNotification,
    }: CustomMutationDataRequest<TPayload, TData>): Promise<TData> => {
        const targetUrl = resolveApiUrl(url, apiUrl);

        const {
            errorNotification: resolvedErrorNotification,
            successNotification: resolvedSuccessNotification,
        } = resolveMutationNotifications({
            resource,
            action: getMethodNotificationAction(method),
            requestErrorMessage,
            requestErrorNotification,
            hookErrorMessage: errorMessage,
            hookErrorNotification: errorNotification,
            requestSuccessMessage,
            requestSuccessNotification,
            hookSuccessMessage: successMessage,
            hookSuccessNotification: successNotification,
        });

        try {
            const response = await mutation.mutateAsync({
                method,
                url: targetUrl,
                values: values ?? ({} as TPayload),
                errorNotification: resolvedErrorNotification as any,
                successNotification: resolvedSuccessNotification as any,
            });

            await (requestOnSuccess ?? onSuccess)?.(response.data);
            return response.data;
        } catch (error) {
            await (requestOnError ?? onError)?.(error as HttpError);
            throw error;
        }
    };

    return {
        apiUrl,
        mutation,
        isLoading: mutation.mutation.isPending,
        handleCustomMutationData,
    };
};
