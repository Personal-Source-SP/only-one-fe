import { getErrorNotification, NotificationAction } from '@/utilities';
import type { BaseRecord, HttpError } from '@refinedev/core';
import { useOne } from '@refinedev/core';

type RefineUseOneRequest<TData extends BaseRecord> = Parameters<typeof useOne<TData, HttpError>>[0];

export type UseCustomOneRequest<TData extends BaseRecord> = Omit<
    RefineUseOneRequest<TData>,
    'id' | 'queryOptions' | 'resource'
> & {
    resource: string;
    id?: RefineUseOneRequest<TData>['id'] | null;
    enabled?: boolean;
    errorMessage?: string;
    queryOptions?: RefineUseOneRequest<TData>['queryOptions'];
    successMessage?: string;
};

export const useCustomOne = <TData extends BaseRecord>({
    id,
    resource,
    enabled,
    errorMessage,
    queryOptions,
    errorNotification,
    successNotification = false,
    ...rest
}: UseCustomOneRequest<TData>) => {
    return useOne<TData, HttpError>({
        ...rest,
        resource,
        id: id ?? '',
        errorNotification: getErrorNotification({
            resource,
            errorNotification,
            message: errorMessage,
            action: NotificationAction.Load,
        }),
        successNotification,
        queryOptions: {
            ...queryOptions,
            enabled: enabled ?? queryOptions?.enabled ?? Boolean(id),
        },
    });
};
