import type {
    CustomHttpMethod,
    IBaseApiCallbackRequest,
    IBaseApiMutationResponse,
    IBaseApiNotificationRequest,
    IBaseApiUrlRequest,
    IBaseApiUrlResponse,
} from '@/interfaces';
import {
    getMethodNotificationAction,
    resolveApiUrl,
    resolveMutationNotifications,
} from '@/utilities';
import type { BaseRecord, HttpError } from '@refinedev/core';
import { useApiUrl, useCustomMutation } from '@refinedev/core';

export type CustomMutationMethod = Extract<CustomHttpMethod, 'post' | 'put' | 'delete' | 'patch'>;

export interface CustomMutationDataRequest<
    TPayload = unknown,
    TData extends BaseRecord = BaseRecord,
>
    extends IBaseApiUrlRequest, IBaseApiNotificationRequest, IBaseApiCallbackRequest<TData> {
    values?: TPayload;
    method?: CustomMutationMethod;
}

export interface UseCustomMutationDataRequest<TData extends BaseRecord = BaseRecord>
    extends IBaseApiNotificationRequest, IBaseApiCallbackRequest<TData> {
    method?: CustomMutationMethod;
}

export interface UseCustomMutationDataResponse<TData extends BaseRecord, TPayload = unknown>
    extends IBaseApiUrlResponse, IBaseApiMutationResponse<TData, TPayload> {
    handleCustomMutationData: (
        request: CustomMutationDataRequest<TPayload, TData>,
    ) => Promise<TData>;
}

export const useCustomMutationData = <TData extends BaseRecord = BaseRecord, TPayload = unknown>({
    resource,
    method: defaultMethod = 'post',
    errorNotification,
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
        errorNotification: requestErrorNotification,
        onSuccess: requestOnSuccess,
        successNotification: requestSuccessNotification,
    }: CustomMutationDataRequest<TPayload, TData>): Promise<TData> => {
        const targetUrl = resolveApiUrl(url, apiUrl);

        const {
            errorNotification: resolvedErrorNotification,
            successNotification: resolvedSuccessNotification,
        } = resolveMutationNotifications({
            resource,
            action: getMethodNotificationAction(method),
            requestErrorNotification,
            hookErrorNotification: errorNotification,
            requestSuccessNotification,
            hookSuccessNotification: successNotification,
        });

        try {
            const response = await mutation.mutateAsync({
                method,
                url: targetUrl,
                values: values ?? ({} as TPayload),
                errorNotification: resolvedErrorNotification,
                successNotification: resolvedSuccessNotification,
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
