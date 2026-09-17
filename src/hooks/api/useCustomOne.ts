import type { IBaseApiNotificationRequest, IBaseApiTransformRequest } from '@/interfaces';
import { applyDataTransform, resolveQueryNotifications } from '@/utilities';
import type { BaseRecord, HttpError } from '@refinedev/core';
import { useOne } from '@refinedev/core';
import { useMemo } from 'react';

type RefineUseOneRequest<TData extends BaseRecord> = Parameters<typeof useOne<TData, HttpError>>[0];

export type UseCustomOneRequest<TData extends BaseRecord = BaseRecord, TTransformed = TData> = Omit<
    RefineUseOneRequest<TData>,
    'id' | 'queryOptions' | 'resource' | 'errorNotification' | 'successNotification'
> &
    IBaseApiNotificationRequest &
    IBaseApiTransformRequest<TData, TTransformed> & {
        resource: string;
        id?: RefineUseOneRequest<TData>['id'] | null;
        enabled?: boolean;
        queryOptions?: RefineUseOneRequest<TData>['queryOptions'];
    };

export const useCustomOne = <TData extends BaseRecord = BaseRecord, TTransformed = TData>({
    id,
    resource,
    enabled,
    errorMessage,
    errorDescription,
    queryOptions,
    errorNotification,
    successNotification = false,
    transform,
    ...rest
}: UseCustomOneRequest<TData, TTransformed>) => {
    const resolvedNotifications = resolveQueryNotifications({
        resource,
        errorMessage,
        errorDescription,
        errorNotification,
        successNotification,
    });

    const isEnabled =
        enabled !== undefined
            ? enabled
            : queryOptions?.enabled !== undefined
              ? queryOptions.enabled
              : Boolean(id);

    const refineResult = useOne<TData, HttpError>({
        ...rest,
        resource,
        id: id ?? '',
        ...resolvedNotifications,
        queryOptions: {
            ...queryOptions,
            enabled: isEnabled,
        },
    });

    const rawData = refineResult.query.data?.data ?? refineResult.result;

    const transformedData = useMemo(
        () => applyDataTransform(rawData, undefined, transform),
        [rawData, transform],
    );

    return {
        ...refineResult,
        data: transformedData,
        result: transformedData,
    };
};
