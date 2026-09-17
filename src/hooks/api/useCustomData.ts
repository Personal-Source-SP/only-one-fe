import type {
    CustomHttpMethod,
    IBaseApiNotificationRequest,
    IBaseApiQueryRequest,
    IBaseApiQueryResponse,
    IBaseApiTransformRequest,
    IBaseApiUrlRequest,
    IBaseApiUrlResponse,
} from '@/interfaces';
import {
    applyDataTransform,
    resolveApiUrl,
    resolveQueryNotifications,
    unwrapApiResponse,
} from '@/utilities';
import type { BaseRecord, HttpError } from '@refinedev/core';
import { useApiUrl, useCustom } from '@refinedev/core';
import { useMemo } from 'react';

export interface UseCustomDataRequest<TData extends BaseRecord = BaseRecord, TTransformed = TData>
    extends
        IBaseApiUrlRequest,
        IBaseApiNotificationRequest,
        IBaseApiQueryRequest<Parameters<typeof useCustom<TData, HttpError>>[0]['queryOptions']>,
        IBaseApiTransformRequest<TData, TTransformed> {
    method?: CustomHttpMethod;
    query?: Record<string, unknown>;
}

export interface UseCustomDataResponse<TData = unknown, TQueryData extends BaseRecord = BaseRecord>
    extends IBaseApiUrlResponse, IBaseApiQueryResponse<TData, TQueryData> {}

export const useCustomData = <TData extends BaseRecord = BaseRecord, TTransformed = TData>({
    url,
    query,
    resource,
    enabled = true,
    method = 'get',
    errorMessage,
    errorDescription,
    errorNotification,
    successNotification = false,
    refetchInterval,
    queryOptions,
    transform,
}: UseCustomDataRequest<TData, TTransformed>): UseCustomDataResponse<TTransformed> => {
    const apiUrl = useApiUrl();
    const targetUrl = resolveApiUrl(url, apiUrl);

    const resolvedNotifications = resolveQueryNotifications({
        resource,
        errorMessage,
        errorDescription,
        errorNotification,
        successNotification,
    });

    const { query: customQuery, result } = useCustom<TData, HttpError>({
        method,
        url: targetUrl,
        config: { query },
        queryOptions: { enabled, refetchInterval, ...queryOptions },
        ...resolvedNotifications,
    });

    const rawResponse = result?.data;
    const unwrappedData = useMemo(() => unwrapApiResponse<TData>(rawResponse), [rawResponse]);
    const transformedData = useMemo(
        () => applyDataTransform(unwrappedData, rawResponse, transform),
        [unwrappedData, rawResponse, transform],
    );

    return {
        apiUrl,
        result,
        query: customQuery,
        data: transformedData,
    };
};
