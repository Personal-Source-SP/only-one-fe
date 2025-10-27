import { useModalForm } from '@refinedev/antd';
import { OpenNotificationParams } from '@refinedev/core';

interface IUseCustomModalProps {
    resource: string;
    action?: 'create' | 'edit';
    autoResetForm?: boolean;
    warnWhenUnsavedChanges?: boolean;
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
    onMutationError?: (error: any) => void;
    onMutationSuccess?: (data: any) => void;
}

export const useCustomModal = (props: IUseCustomModalProps) => {
    const { open, show, close, formProps, modalProps, formLoading } = useModalForm({
        resource: props.resource,
        action: props?.action ?? 'create',
        autoResetForm: props?.autoResetForm ?? true,
        warnWhenUnsavedChanges: props?.warnWhenUnsavedChanges ?? false,
        errorNotification: props?.errorNotification ?? false,
        successNotification: props?.successNotification ?? false,
        onMutationError: props?.onMutationError,
        onMutationSuccess: props?.onMutationSuccess,
    });

    return {
        open,
        show,
        close,
        formProps,
        modalProps,
        formLoading,
    };
};
