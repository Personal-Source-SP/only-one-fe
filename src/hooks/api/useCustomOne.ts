import { useMemo } from 'react';
import { getErrorNotification, NotificationAction } from '@/utilities';
import type { BaseRecord, HttpError } from '@refinedev/core';
import { useOne } from '@refinedev/core';

type RefineUseOneRequest<TData extends BaseRecord> = Parameters<typeof useOne<TData, HttpError>>[0];

export type UseCustomOneRequest<TData extends BaseRecord = BaseRecord, TTransformed = TData> = Omit<
    RefineUseOneRequest<TData>,
    'id' | 'queryOptions' | 'resource'
> & {
    resource: string;
    id?: RefineUseOneRequest<TData>['id'] | null;
    enabled?: boolean;
    errorMessage?: string;
    queryOptions?: RefineUseOneRequest<TData>['queryOptions'];
    successMessage?: string;
    transform?: (data: TData | undefined) => TTransformed;
};

export const useCustomOne = <TData extends BaseRecord = BaseRecord, TTransformed = TData>({
    id,
    resource,
    enabled,
    errorMessage,
    queryOptions,
    errorNotification,
    successNotification = false,
    transform,
    ...rest
}: UseCustomOneRequest<TData, TTransformed>) => {
    const refineResult = useOne<TData, HttpError>({
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

    const rawData = refineResult.query.data?.data ?? refineResult.result;

    const transformedData = useMemo(() => {
        if (transform) {
            return transform(rawData);
        }
        return rawData as unknown as TTransformed;
    }, [rawData, transform]);

    return {
        ...refineResult,
        data: transformedData,
        result: transformedData,
    };
};
