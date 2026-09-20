import { useMemo } from 'react';
import type { BaseRecord, HttpError } from '@refinedev/core';
import { useList } from '@refinedev/core';

import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE, DEFAULT_SORTERS } from '@/config';
import type { IBaseApiNotificationRequest, IBaseApiTransformRequest } from '@/interfaces';
import { applyDataTransform, resolveQueryNotifications } from '@/utilities';

type RefineUseListRequest<TData extends BaseRecord> = NonNullable<
    Parameters<typeof useList<TData, HttpError>>[0]
>;

export type UseCustomListRequest<
    TData extends BaseRecord = BaseRecord,
    TTransformed = TData[],
> = Omit<RefineUseListRequest<TData>, 'resource' | 'errorNotification' | 'successNotification'> &
    IBaseApiNotificationRequest &
    IBaseApiTransformRequest<TData[], TTransformed> & {
        resource: string;
    };

export const useCustomList = <TData extends BaseRecord = BaseRecord, TTransformed = TData[]>({
    resource,
    pagination,
    sorters,
    errorNotification,
    successNotification = false,
    transform,
    ...rest
}: UseCustomListRequest<TData, TTransformed>) => {
    const resolvedNotifications = resolveQueryNotifications({
        resource,
        errorNotification,
        successNotification,
    });

    const refineResult = useList<TData, HttpError>({
        ...rest,
        resource,
        sorters: sorters ?? DEFAULT_SORTERS,
        pagination: pagination ?? {
            pageSize: DEFAULT_PAGE_SIZE,
            currentPage: DEFAULT_PAGE_INDEX,
        },
        ...resolvedNotifications,
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
