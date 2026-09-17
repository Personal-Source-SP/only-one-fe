import type { IBaseApiCallbackRequest, IBaseApiNotificationRequest } from '@/interfaces';
import {
    getErrorNotification,
    getFormNotificationAction,
    getSuccessNotification,
} from '@/utilities';
import { useModalForm } from '@refinedev/antd';
import type { BaseRecord, HttpError } from '@refinedev/core';

export interface IUseCustomModalProps<
    TQueryFnData extends BaseRecord = any,
    TVariables = any,
    TData extends BaseRecord = TQueryFnData,
>
    extends IBaseApiNotificationRequest, IBaseApiCallbackRequest<TData> {
    resource: string;
    autoResetForm?: boolean;
    action?: 'create' | 'edit';
    warnWhenUnsavedChanges?: boolean;
    onMutationError?: (error: any) => void;
    onMutationSuccess?: (data: any) => void;
}

export const useCustomModal = <
    TQueryFnData extends BaseRecord = any,
    TVariables = any,
    TData extends BaseRecord = TQueryFnData,
>(
    props: IUseCustomModalProps<TQueryFnData, TVariables, TData>,
) => {
    const {
        resource,
        action = 'create',
        autoResetForm = true,
        warnWhenUnsavedChanges = false,
        errorMessage,
        errorDescription,
        errorNotification,
        successMessage,
        successDescription,
        successNotification,
        onMutationError,
        onMutationSuccess,
        onError,
        onSuccess,
    } = props;

    const { open, show, close, formProps, modalProps, formLoading } = useModalForm<
        TQueryFnData,
        HttpError,
        TVariables,
        TData
    >({
        resource,
        action,
        autoResetForm,
        warnWhenUnsavedChanges,
        errorNotification: getErrorNotification({
            resource,
            errorNotification,
            message: errorMessage,
            description: errorDescription,
            action: getFormNotificationAction(action),
        }) as any,
        successNotification: getSuccessNotification({
            resource,
            successNotification,
            message: successMessage,
            description: successDescription,
            action: getFormNotificationAction(action),
        }) as any,
        onMutationError: onMutationError ?? (onError ? (error: any) => onError(error) : undefined),
        onMutationSuccess:
            onMutationSuccess ??
            (onSuccess ? (data: any) => onSuccess(data?.data ?? data) : undefined),
    });

    return { open, formProps, modalProps, formLoading, show, close };
};
