import { NotificationAction, resolveApiUrl, resolveMutationNotifications } from '@/utilities';
import type { BaseKey, BaseRecord, HttpError, OpenNotificationParams } from '@refinedev/core';
import { useApiUrl, useCustomMutation } from '@refinedev/core';
import type {
    IBaseApiCallbackRequest,
    IBaseApiMutationResponse,
    IBaseApiNotificationRequest,
} from '@/interfaces';

export interface CustomDeleteVariables {
    id?: BaseKey;
    ids?: BaseKey[];
}

export interface HandleCustomDeleteRequest<TData extends BaseRecord = BaseRecord>
    extends IBaseApiNotificationRequest, IBaseApiCallbackRequest<TData> {
    id?: BaseKey;
    ids?: BaseKey[];
}

export interface UseCustomDeleteRequest<TData extends BaseRecord = BaseRecord>
    extends IBaseApiNotificationRequest, IBaseApiCallbackRequest<TData> {}

export interface UseCustomDeleteResponse<
    TData extends BaseRecord = BaseRecord,
> extends IBaseApiMutationResponse<TData, CustomDeleteVariables> {
    handleDelete: (
        requestOrIds: HandleCustomDeleteRequest<TData> | (string | number)[],
    ) => Promise<TData | void>;
}

export const useCustomDelete = <TData extends BaseRecord = BaseRecord>({
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

        const targetPath = id ? `${resource}/${id}` : (resource ?? '');
        const url = resolveApiUrl(targetPath, apiUrl);

        const {
            errorNotification: resolvedErrorNotification,
            successNotification: resolvedSuccessNotification,
        } = resolveMutationNotifications({
            resource,
            action: NotificationAction.Delete,
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
                url,
                method: 'delete',
                values: ids?.length ? { ids } : {},
                errorNotification: resolvedErrorNotification,
                successNotification: resolvedSuccessNotification,
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
        isLoading: mutation.mutation.isPending,
        handleDelete,
    };
};
