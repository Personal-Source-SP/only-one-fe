import { NBaseApi } from '@/interfaces';
import { OpenNotificationParams, useApiUrl, useCustom, useCustomMutation } from '@refinedev/core';

interface IUseCustomDataProps {
    url: string;
    enabled?: boolean;
    method?: 'get' | 'post' | 'put' | 'delete' | 'patch';
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
}

interface IUseCustomMutationDataProps {
    url: string;
    values?: any;
    method?: 'post' | 'put' | 'delete' | 'patch';
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
}

export const useCustomData = (props: IUseCustomDataProps) => {
    const apiUrl = useApiUrl();

    const { result, query } = useCustom<NBaseApi.IResponse<any>>({
        url: `${apiUrl}/${props.url}`,
        method: props.method ?? 'get',
        queryOptions: {
            enabled: props.enabled ?? true,
        },
        errorNotification: props.errorNotification ?? false,
        successNotification: props.successNotification ?? false,
    });

    return { result, query, apiUrl };
};

export const useCustomMutationData = () => {
    const apiUrl = useApiUrl();

    const { mutateAsync } = useCustomMutation<NBaseApi.IResponse<any>>();

    const handleCustomMutationData = (options: IUseCustomMutationDataProps) => {
        mutateAsync({
            values: options?.values ?? {},
            method: options.method ?? 'post',
            url: `${apiUrl}/${options.url}`,
            errorNotification: options.errorNotification ?? false,
            successNotification: options.successNotification ?? false,
        });
    };

    return { handleCustomMutationData, apiUrl };
};
