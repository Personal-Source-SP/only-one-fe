import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE, DEFAULT_SORTERS } from '@/config';
import type { IBaseApiNotificationRequest, IBaseApiTransformRequest } from '@/interfaces';
import { applyDataTransform, resolveQueryNotifications } from '@/utilities';
import type { BaseRecord, HttpError } from '@refinedev/core';
import { useList } from '@refinedev/core';
import { useMemo } from 'react';

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
    errorMessage,
    errorDescription,
    pagination,
    sorters,
    errorNotification,
    successNotification = false,
    transform,
    ...rest
}: UseCustomListRequest<TData, TTransformed>) => {
    const resolvedNotifications = resolveQueryNotifications({
        resource,
        errorMessage,
        errorDescription,
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

    const rawList = useMemo(() => {
        const items = refineResult.query.data?.data ?? refineResult.result?.data ?? [];
        return Array.isArray(items) ? (items as TData[]) : [];
    }, [refineResult.query.data?.data, refineResult.result?.data]);

    const transformedData = useMemo(
        () => applyDataTransform(rawList, undefined, transform),
        [rawList, transform],
    );

    return {
        ...refineResult,
        data: transformedData,
        result: { ...refineResult.result, data: transformedData as unknown as TData[] },
    };
};
