import type { IBaseApiNotificationRequest, IBaseApiResourceRequest } from '@/interfaces';
import { resolveFormNotifications, unwrapApiResponse } from '@/utilities';
import { useModalForm } from '@refinedev/antd';
import type { BaseRecord, HttpError } from '@refinedev/core';

export interface IUseCustomModalProps<
    TQueryFnData extends BaseRecord = BaseRecord,
    TVariables = Record<string, unknown>,
    TData extends BaseRecord = TQueryFnData,
>
    extends IBaseApiResourceRequest, IBaseApiNotificationRequest {
    autoResetForm?: boolean;
    action?: 'create' | 'edit';
    warnWhenUnsavedChanges?: boolean;
    onMutationError?: (error: HttpError) => void;
    onMutationSuccess?: (data: TData) => void;
}

export const useCustomModal = <
    TQueryFnData extends BaseRecord = BaseRecord,
    TVariables = Record<string, unknown>,
    TData extends BaseRecord = TQueryFnData,
>(
    props: IUseCustomModalProps<TQueryFnData, TVariables, TData>,
) => {
    const {
        resource,
        action = 'create',
        autoResetForm = true,
        warnWhenUnsavedChanges = false,
        errorNotification,
        successNotification,
        onMutationError,
        onMutationSuccess,
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
        ...resolveFormNotifications({
            resource,
            action,
            errorNotification,
            successNotification,
        }),
        onMutationError,
        onMutationSuccess: onMutationSuccess
            ? (response: unknown) =>
                  onMutationSuccess((unwrapApiResponse<TData>(response) ?? response) as TData)
            : undefined,
    });

    return {
        open,
        formProps,
        modalProps,
        formLoading,
        isLoading: Boolean(formLoading),
        show,
        close,
    };
};
