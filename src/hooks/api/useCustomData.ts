import { getErrorNotification, NotificationAction } from '@/utilities';
import type { BaseRecord, HttpError, OpenNotificationParams } from '@refinedev/core';
import { useApiUrl, useCustom } from '@refinedev/core';

export type CustomDataMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

export interface UseCustomDataRequest<TData extends BaseRecord = any> {
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
}

export interface UseCustomDataResponse<TData extends BaseRecord = any> {
    apiUrl: string;
    query: ReturnType<typeof useCustom<TData, HttpError>>['query'];
    result: ReturnType<typeof useCustom<TData, HttpError>>['result'];
    data: TData | undefined;
}

export const useCustomData = <TData extends BaseRecord = any>({
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
}: UseCustomDataRequest<TData>): UseCustomDataResponse<TData> => {
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

    return {
        apiUrl,
        result,
        data: result?.data,
        query: customQuery,
    };
};

export { useCustomMutationData } from './useCustomMutationData';
