import { useMemo } from 'react';
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE, DEFAULT_SORTERS } from '@/config';
import { getErrorNotification, NotificationAction } from '@/utilities';
import type { BaseRecord, HttpError } from '@refinedev/core';
import { useList } from '@refinedev/core';

type RefineUseListRequest<TData extends BaseRecord> = NonNullable<
    Parameters<typeof useList<TData, HttpError>>[0]
>;

export type UseCustomListRequest<
    TData extends BaseRecord = BaseRecord,
    TTransformed = TData[],
> = Omit<RefineUseListRequest<TData>, 'resource'> & {
    resource: string;
    errorMessage?: string;
    successMessage?: string;
    transform?: (data: TData[]) => TTransformed;
};

export const useCustomList = <TData extends BaseRecord = BaseRecord, TTransformed = TData[]>({
    resource,
    errorMessage,
    pagination,
    sorters,
    errorNotification,
    successNotification = false,
    transform,
    ...rest
}: UseCustomListRequest<TData, TTransformed>) => {
    const refineResult = useList<TData, HttpError>({
        ...rest,
        resource,
        pagination: pagination ?? {
            pageSize: DEFAULT_PAGE_SIZE,
            currentPage: DEFAULT_PAGE_INDEX,
        },
        sorters: sorters ?? DEFAULT_SORTERS,
        errorNotification: getErrorNotification({
            resource,
            errorNotification,
            message: errorMessage,
            action: NotificationAction.Load,
        }),
        successNotification,
    });

    const rawList = useMemo(() => {
        const items = refineResult.query.data?.data ?? refineResult.result?.data ?? [];
        return Array.isArray(items) ? (items as TData[]) : [];
    }, [refineResult.query.data?.data, refineResult.result?.data]);

    const transformedData = useMemo(() => {
        if (transform) {
            return transform(rawList);
        }
        return rawList as unknown as TTransformed;
    }, [rawList, transform]);

    return {
        ...refineResult,
        data: transformedData,
        result: {
            ...refineResult.result,
            data: transformedData as any,
        },
    };
};
