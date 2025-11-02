import { NBaseApi } from '@/interfaces';
import { OpenNotificationParams, useApiUrl, useCustomMutation } from '@refinedev/core';

interface IUseDeleteDataHistoryProps {
    resource?: string;
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

export const useCustomDelete = (props: IUseDeleteDataHistoryProps) => {
    const apiUrl = useApiUrl();

    const { mutate } = useCustomMutation<NBaseApi.IResponse<boolean>>();

    const handleDelete = (ids: string[]) => {
        mutate({
            values: { ids },
            method: 'delete',
            url: `${apiUrl}/${props.resource ?? ''}`,
            errorNotification: props.errorNotification ?? false,
            successNotification: props.successNotification ?? false,
        });
    };

    return { handleDelete };
};
