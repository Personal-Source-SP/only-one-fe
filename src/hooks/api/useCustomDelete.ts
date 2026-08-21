import { getErrorNotification, getSuccessNotification, NotificationAction } from '@/utilities';
import type { BaseKey, BaseRecord, HttpError, OpenNotificationParams } from '@refinedev/core';
import { useApiUrl, useCustomMutation } from '@refinedev/core';

export interface CustomDeleteVariables {
    id?: BaseKey;
    ids?: BaseKey[];
}

export interface HandleCustomDeleteRequest<TData extends BaseRecord = BaseRecord> {
    id?: BaseKey;
    ids?: BaseKey[];
    errorMessage?: string;
    successMessage?: string;
    errorNotification?:
        | OpenNotificationParams
        | false
        | ((
              error?: any,
              values?: any,
              resource?: string,
          ) => OpenNotificationParams | false | undefined);
    successNotification?:
        | OpenNotificationParams
        | false
        | ((
              data?: any,
              values?: any,
              resource?: string,
          ) => OpenNotificationParams | false | undefined);
    onSuccess?: (data: TData) => void | Promise<void>;
    onError?: (error: HttpError) => void | Promise<void>;
}

export interface UseCustomDeleteRequest<TData extends BaseRecord = BaseRecord> {
    resource?: string;
    errorMessage?: string;
    successMessage?: string;
    errorNotification?:
        | OpenNotificationParams
        | false
        | ((
              error?: any,
              values?: any,
              resource?: string,
          ) => OpenNotificationParams | false | undefined);
    successNotification?:
        | OpenNotificationParams
        | false
        | ((
              data?: any,
              values?: any,
              resource?: string,
          ) => OpenNotificationParams | false | undefined);
    onSuccess?: (data: TData) => void | Promise<void>;
    onError?: (error: HttpError) => void | Promise<void>;
}

export interface UseCustomDeleteResponse<TData extends BaseRecord = BaseRecord> {
    handleDelete: (
        requestOrIds: HandleCustomDeleteRequest<TData> | (string | number)[],
    ) => Promise<TData | void>;
    mutation: ReturnType<typeof useCustomMutation<TData, HttpError, CustomDeleteVariables>>;
}

export const useCustomDelete = <TData extends BaseRecord = any>({
    resource,
    errorMessage,
    errorNotification,
    successMessage,
    successNotification,
    onError,
    onSuccess,
}: UseCustomDeleteRequest<TData> = {}): UseCustomDeleteResponse<TData> => {
    const apiUrl = useApiUrl();
    const mutation = useCustomMutation<TData, HttpError, CustomDeleteVariables>();

    const handleDelete = async (
        requestOrIds: HandleCustomDeleteRequest<TData> | (string | number)[],
    ): Promise<TData | void> => {
        const isArrayIds = Array.isArray(requestOrIds);
        const req: HandleCustomDeleteRequest<TData> = isArrayIds
            ? { ids: requestOrIds as BaseKey[] }
            : requestOrIds;

        const {
            id,
            ids,
            errorMessage: requestErrorMessage,
            successMessage: requestSuccessMessage,
            errorNotification: requestErrorNotification,
            successNotification: requestSuccessNotification,
            onError: requestOnError,
            onSuccess: requestOnSuccess,
        } = req;

        const url = id ? `${apiUrl}/${resource}/${id}` : `${apiUrl}/${resource ?? ''}`;

        const resolvedErrorNotification =
            requestErrorNotification !== undefined
                ? requestErrorNotification
                : errorNotification !== undefined
                  ? errorNotification
                  : getErrorNotification({
                        resource,
                        action: NotificationAction.Delete,
                        message: requestErrorMessage ?? errorMessage,
                    });

        const resolvedSuccessNotification =
            requestSuccessNotification !== undefined
                ? requestSuccessNotification
                : successNotification !== undefined
                  ? successNotification
                  : getSuccessNotification({
                        resource,
                        action: NotificationAction.Delete,
                        message: requestSuccessMessage ?? successMessage,
                    });

        try {
            const response = await mutation.mutateAsync({
                method: 'delete',
                values: ids?.length ? { ids } : {},
                url,
                errorNotification: resolvedErrorNotification as OpenNotificationParams | false,
                successNotification: resolvedSuccessNotification as OpenNotificationParams | false,
            });

            await (requestOnSuccess ?? onSuccess)?.(response.data);
            return response.data;
        } catch (error) {
            await (requestOnError ?? onError)?.(error as HttpError);
            if (!isArrayIds) throw error;
        }
    };

    return {
        mutation,
        handleDelete,
    };
};
