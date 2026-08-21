import { useMemo } from 'react';
import { getErrorNotification, NotificationAction } from '@/utilities';
import type { BaseRecord, HttpError, OpenNotificationParams } from '@refinedev/core';
import { useApiUrl, useCustom } from '@refinedev/core';

export type CustomDataMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

export interface UseCustomDataRequest<TData extends BaseRecord = any, TTransformed = TData> {
    url: string;
    query?: Record<string, any>;
    enabled?: boolean;
    refetchInterval?: number | false;
    resource?: string;
    method?: CustomDataMethod;
    errorMessage?: string;
    successMessage?: string;
    errorNotification?:
        | OpenNotificationParams
        | false
        | ((
              error?: any,
              values?: any,
              resource?: string,
          ) => OpenNotificationParams | false | undefined);
    successNotification?:
        | OpenNotificationParams
        | false
        | ((
              data?: any,
              values?: any,
              resource?: string,
          ) => OpenNotificationParams | false | undefined);
    queryOptions?: Parameters<typeof useCustom<TData, HttpError>>[0]['queryOptions'];
    transform?: (data: TData | undefined, rawResponse?: any) => TTransformed;
}

export interface UseCustomDataResponse<TData = any> {
    apiUrl: string;
    query: ReturnType<typeof useCustom<any, HttpError>>['query'];
    result: ReturnType<typeof useCustom<any, HttpError>>['result'];
    data: TData | undefined;
}

export const useCustomData = <TData extends BaseRecord = any, TTransformed = TData>({
    url,
    query,
    resource,
    enabled = true,
    method = 'get',
    errorMessage,
    successNotification = false,
    errorNotification,
    refetchInterval,
    queryOptions,
    transform,
}: UseCustomDataRequest<TData, TTransformed>): UseCustomDataResponse<TTransformed> => {
    const apiUrl = useApiUrl();
    const targetUrl = url.startsWith('http') || url.startsWith('/') ? url : `${apiUrl}/${url}`;

    const { query: customQuery, result } = useCustom<TData, HttpError>({
        url: targetUrl,
        method,
        config: {
            query,
        },
        queryOptions: {
            enabled,
            refetchInterval,
            ...queryOptions,
        },
        errorNotification:
            errorNotification !== undefined
                ? errorNotification
                : getErrorNotification({
                      resource,
                      message: errorMessage,
                      action: NotificationAction.Load,
                  }),
        successNotification,
    });

    const rawResponse = result?.data;
    const unwrappedData = useMemo(() => {
        if (!rawResponse) return undefined;
        if (
            (rawResponse as any)?.data !== undefined &&
            ((rawResponse as any)?.isSuccess !== undefined ||
                (rawResponse as any)?.errors !== undefined ||
                (rawResponse as any)?.meta !== undefined)
        ) {
            return (rawResponse as any).data;
        }
        return (rawResponse as any)?.data !== undefined ? (rawResponse as any).data : rawResponse;
    }, [rawResponse]);

    const transformedData = useMemo(() => {
        if (transform) {
            return transform(unwrappedData as TData, rawResponse);
        }
        return unwrappedData as unknown as TTransformed;
    }, [unwrappedData, rawResponse, transform]);

    return {
        apiUrl,
        result,
        query: customQuery,
        data: transformedData,
    };
};

export { useCustomMutationData } from './useCustomMutationData';
