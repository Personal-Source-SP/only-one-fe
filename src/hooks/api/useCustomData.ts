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
    config?: Parameters<typeof useCustom<TData, HttpError>>[0]['config'];
}

export interface UseCustomDataResponse<TData = unknown, TQueryData extends BaseRecord = BaseRecord>
    extends IBaseApiUrlResponse, IBaseApiQueryResponse<TData, TQueryData> {}

export const useCustomData = <TData extends BaseRecord = BaseRecord, TTransformed = TData>({
    url,
    config,
    resource,
    method = 'get',
    errorNotification,
    successNotification = false,
    queryOptions,
    transform,
}: UseCustomDataRequest<TData, TTransformed>): UseCustomDataResponse<TTransformed> => {
    const apiUrl = useApiUrl();
    const targetUrl = resolveApiUrl(url, apiUrl);

    const resolvedNotifications = resolveQueryNotifications({
        resource,
        errorNotification,
        successNotification,
    });

    const { query, result } = useCustom<TData, HttpError>({
        method,
        config,
        queryOptions,
        url: targetUrl,
        ...resolvedNotifications,
    });

    const transformedData = useMemo(
        () => applyDataTransform(unwrapApiResponse<TData>(query.data?.data), query.data, transform),
        [query.data, transform],
    );

    return {
        query,
        apiUrl,
        result,
        data: transformedData,
        isLoading: query.isLoading,
    };
};
