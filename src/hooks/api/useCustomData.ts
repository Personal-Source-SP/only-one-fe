import type {
    CustomHttpMethod,
    IBaseApiNotificationRequest,
    IBaseApiQueryRequest,
    IBaseApiTransformRequest,
    IBaseApiUrlRequest,
} from '@/interfaces';
import {
    applyDataTransform,
    resolveApiUrl,
    resolveQueryErrorNotification,
    unwrapApiResponse,
} from '@/utilities';
import type { BaseRecord, HttpError } from '@refinedev/core';
import { useApiUrl, useCustom } from '@refinedev/core';
import { useMemo } from 'react';

export interface UseCustomDataRequest<TData extends BaseRecord = any, TTransformed = TData>
    extends
        IBaseApiUrlRequest,
        IBaseApiNotificationRequest,
        IBaseApiQueryRequest<Parameters<typeof useCustom<TData, HttpError>>[0]['queryOptions']>,
        IBaseApiTransformRequest<TData, TTransformed> {
    method?: CustomHttpMethod;
    query?: Record<string, any>;
}

export interface UseCustomDataResponse<TData = any> {
    apiUrl: string;
    data: TData | undefined;
    query: ReturnType<typeof useCustom<any, HttpError>>['query'];
    result: ReturnType<typeof useCustom<any, HttpError>>['result'];
}

export const useCustomData = <TData extends BaseRecord = any, TTransformed = TData>({
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

    const { query: customQuery, result } = useCustom<TData, HttpError>({
        method,
        url: targetUrl,
        config: { query },
        queryOptions: { enabled, refetchInterval, ...queryOptions },
        successNotification,
        errorNotification: resolveQueryErrorNotification({
            resource,
            errorMessage,
            errorDescription,
            errorNotification,
        }),
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
