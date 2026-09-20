import type { BaseKey, BaseRecord, CustomResponse, HttpError } from '@refinedev/core';
import { useApiUrl, useCustomMutation } from '@refinedev/core';

import type {
    IBaseApiCallbackRequest,
    IBaseApiMutationResponse,
    IBaseApiNotificationRequest,
} from '@/interfaces';
import { NotificationAction, resolveApiUrl, resolveMutationNotifications } from '@/utilities';

export interface HandleCustomDeleteRequest<TData extends BaseRecord = BaseRecord>
    extends
        IBaseApiNotificationRequest<CustomResponse<TData>, HttpError, Record<string, unknown>>,
        IBaseApiCallbackRequest<TData> {
    id: BaseKey;
}

export interface UseCustomDeleteRequest<TData extends BaseRecord = BaseRecord>
    extends
        IBaseApiNotificationRequest<CustomResponse<TData>, HttpError, Record<string, unknown>>,
        IBaseApiCallbackRequest<TData> {}

export interface UseCustomDeleteResponse<
    TData extends BaseRecord = BaseRecord,
> extends IBaseApiMutationResponse<TData, Record<string, unknown>> {
    handleDelete: (
        requestOrId: HandleCustomDeleteRequest<TData> | BaseKey,
    ) => Promise<TData | void>;
}

export const useCustomDelete = <TData extends BaseRecord = BaseRecord>({
    resource,
    errorNotification,
    successNotification,
    onError,
    onSuccess,
}: UseCustomDeleteRequest<TData> = {}): UseCustomDeleteResponse<TData> => {
    const apiUrl = useApiUrl();
    const mutation = useCustomMutation<TData, HttpError, Record<string, unknown>>();

    const handleDelete = async (
        requestOrId: HandleCustomDeleteRequest<TData> | BaseKey,
    ): Promise<TData | void> => {
        const isPrimitive = typeof requestOrId === 'string' || typeof requestOrId === 'number';
        const req: HandleCustomDeleteRequest<TData> = isPrimitive
            ? { id: requestOrId }
            : requestOrId;

        const {
            id,
            errorNotification: requestErrorNotification,
            successNotification: requestSuccessNotification,
        } = req;

        const targetPath = id ? `${resource}/${id}` : (resource ?? '');
        const url = resolveApiUrl(targetPath, apiUrl);

        const {
            errorNotification: resolvedErrorNotification,
            successNotification: resolvedSuccessNotification,
        } = resolveMutationNotifications({
            resource,
            action: NotificationAction.Delete,
            requestErrorNotification,
            hookErrorNotification: errorNotification,
            requestSuccessNotification,
            hookSuccessNotification: successNotification,
        });

        try {
            const response = await mutation.mutateAsync({
                url,
                values: {},
                method: 'delete',
                errorNotification: resolvedErrorNotification,
                successNotification: resolvedSuccessNotification,
            });

            await onSuccess?.(response.data);
            return response.data;
        } catch (error) {
            await onError?.(error as HttpError);
            if (!isPrimitive) throw error;
        }
    };

    return {
        mutation,
        isLoading: mutation.mutation.isPending,
        handleDelete,
    };
};
