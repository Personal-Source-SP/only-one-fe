import { useMemo } from 'react';
import { applyDataTransform, resolveQueryErrorNotification } from '@/utilities';
import type { BaseRecord, HttpError } from '@refinedev/core';
import { useOne } from '@refinedev/core';
import type { IBaseApiNotificationRequest, IBaseApiTransformRequest } from '@/interfaces';

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
    const refineResult = useOne<TData, HttpError>({
        ...rest,
        resource,
        id: id ?? '',
        errorNotification: resolveQueryErrorNotification({
            resource,
            errorMessage,
            errorDescription,
            errorNotification,
        }),
        successNotification,
        queryOptions: {
            ...queryOptions,
            enabled: enabled ?? queryOptions?.enabled ?? Boolean(id),
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
