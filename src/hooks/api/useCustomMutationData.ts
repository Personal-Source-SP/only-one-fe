import { getErrorNotification, getSuccessNotification, NotificationAction } from '@/utilities';
import type { BaseRecord, HttpError, OpenNotificationParams } from '@refinedev/core';
import { useApiUrl, useCustomMutation } from '@refinedev/core';

export type CustomMutationMethod = 'post' | 'put' | 'delete' | 'patch';

export interface CustomMutationDataRequest<TPayload = any, TData extends BaseRecord = BaseRecord> {
    url: string;
    errorMessage?: string;
    errorNotification?:
        | OpenNotificationParams
        | false
        | ((
              error?: any,
              values?: any,
              resource?: string,
          ) => OpenNotificationParams | false | undefined | any);
    method?: CustomMutationMethod;
    successMessage?: string;
    successNotification?:
        | OpenNotificationParams
        | false
        | ((
              data?: any,
              values?: any,
              resource?: string,
          ) => OpenNotificationParams | false | undefined | any);
    values?: TPayload;
    onSuccess?: (data: TData) => void | Promise<void>;
    onError?: (error: HttpError) => void | Promise<void>;
}

export interface UseCustomMutationDataRequest<TData extends BaseRecord = BaseRecord> {
    errorMessage?: string;
    errorNotification?:
        | OpenNotificationParams
        | false
        | ((
              error?: any,
              values?: any,
              resource?: string,
          ) => OpenNotificationParams | false | undefined | any);
    method?: CustomMutationMethod;
    resource?: string;
    successMessage?: string;
    successNotification?:
        | OpenNotificationParams
        | false
        | ((
              data?: any,
              values?: any,
              resource?: string,
          ) => OpenNotificationParams | false | undefined | any);
    onSuccess?: (data: TData) => void | Promise<void>;
    onError?: (error: HttpError) => void | Promise<void>;
}

export interface UseCustomMutationDataResponse<TData extends BaseRecord, TPayload> {
    apiUrl: string;
    handleCustomMutationData: (
        request: CustomMutationDataRequest<TPayload, TData>,
    ) => Promise<TData>;
    mutation: ReturnType<typeof useCustomMutation<TData, HttpError, TPayload>>;
}

const getNotificationAction = (method: CustomMutationMethod): NotificationAction => {
    switch (method) {
        case 'post':
            return NotificationAction.Create;
        case 'delete':
            return NotificationAction.Delete;
        default:
            return NotificationAction.Update;
    }
};

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
        errorMessage: requestErrorMessage,
        errorNotification: requestErrorNotification,
        successMessage: requestSuccessMessage,
        successNotification: requestSuccessNotification,
        onSuccess: requestOnSuccess,
        onError: requestOnError,
    }: CustomMutationDataRequest<TPayload, TData>): Promise<TData> => {
        const targetUrl = url.startsWith('http') || url.startsWith('/') ? url : `${apiUrl}/${url}`;

        const resolvedErrorNotification =
            requestErrorNotification !== undefined
                ? requestErrorNotification
                : errorNotification !== undefined
                  ? errorNotification
                  : getErrorNotification({
                        resource,
                        action: getNotificationAction(method),
                        message: requestErrorMessage ?? errorMessage,
                    });

        const resolvedSuccessNotification =
            requestSuccessNotification !== undefined
                ? requestSuccessNotification
                : successNotification !== undefined
                  ? successNotification
                  : getSuccessNotification({
                        resource,
                        action: getNotificationAction(method),
                        message: requestSuccessMessage ?? successMessage,
                    });

        try {
            const response = await mutation.mutateAsync({
                url: targetUrl,
                method,
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
        handleCustomMutationData,
    };
};
