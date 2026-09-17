import type {
    IBaseApiCallbackRequest,
    IBaseApiNotificationRequest,
    IBaseApiResourceRequest,
} from '@/interfaces';
import { resolveFormNotifications } from '@/utilities';
import { useModalForm } from '@refinedev/antd';
import type { BaseRecord, HttpError } from '@refinedev/core';

export interface IUseCustomModalProps<
    TQueryFnData extends BaseRecord = BaseRecord,
    TVariables = Record<string, unknown>,
    TData extends BaseRecord = TQueryFnData,
>
    extends IBaseApiResourceRequest, IBaseApiNotificationRequest, IBaseApiCallbackRequest<TData> {
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

    const resolvedNotifications = resolveFormNotifications({
        resource,
        action,
        errorMessage,
        errorDescription,
        errorNotification,
        successMessage,
        successDescription,
        successNotification,
    });

    const handleMutationSuccess =
        onMutationSuccess || onSuccess
            ? (response: any) => {
                  const payload = response?.data !== undefined ? response.data : response;
                  if (onMutationSuccess) onMutationSuccess(payload);
                  if (onSuccess) onSuccess(payload);
              }
            : undefined;

    const handleMutationError =
        onMutationError || onError
            ? (error: HttpError) => {
                  if (onMutationError) onMutationError(error);
                  if (onError) onError(error);
              }
            : undefined;

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
        ...resolvedNotifications,
        onMutationError: handleMutationError,
        onMutationSuccess: handleMutationSuccess,
    });

    return { open, formProps, modalProps, formLoading, show, close };
};
