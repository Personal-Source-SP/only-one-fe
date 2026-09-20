import { useMemo } from 'react';
import type { BaseRecord, HttpError } from '@refinedev/core';
import { useOne } from '@refinedev/core';

import type { IBaseApiNotificationRequest, IBaseApiTransformRequest } from '@/interfaces';
import { applyDataTransform, resolveQueryNotifications } from '@/utilities';

type RefineUseOneRequest<TData extends BaseRecord> = Parameters<typeof useOne<TData, HttpError>>[0];

export type UseCustomOneRequest<TData extends BaseRecord = BaseRecord, TTransformed = TData> = Omit<
    RefineUseOneRequest<TData>,
    'id' | 'queryOptions' | 'resource' | 'errorNotification' | 'successNotification'
> &
    IBaseApiNotificationRequest &
    IBaseApiTransformRequest<TData, TTransformed> & {
        resource: string;
        id?: RefineUseOneRequest<TData>['id'] | null;
        queryOptions?: RefineUseOneRequest<TData>['queryOptions'];
    };

export const useCustomOne = <TData extends BaseRecord = BaseRecord, TTransformed = TData>({
    id,
    resource,
    queryOptions,
    errorNotification,
    successNotification = false,
    transform,
    ...rest
}: UseCustomOneRequest<TData, TTransformed>) => {
    const resolvedNotifications = resolveQueryNotifications({
        resource,
        errorNotification,
        successNotification,
    });

    const isEnabled = queryOptions?.enabled !== undefined ? queryOptions.enabled : Boolean(id);

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

    const transformedData = useMemo(
        () => applyDataTransform(refineResult.query.data?.data, refineResult.query.data, transform),
        [refineResult.query.data, transform],
    );

    return {
        ...refineResult,
        data: transformedData,
        isLoading: Boolean(refineResult.query.isLoading),
    };
};
