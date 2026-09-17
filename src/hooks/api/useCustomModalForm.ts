import {
    createFormFinishHandler,
    createSaveButtonProps,
    resolveFormNotifications,
} from '@/utilities';
import { useModalForm } from '@refinedev/antd';
import type { BaseRecord, GetOneResponse, HttpError } from '@refinedev/core';
import type { ButtonProps, FormInstance, FormProps } from '@/components/custom-antd';
import type {
    FormMode,
    IBaseApiFormRequest,
    IBaseApiFormResponse,
    IBaseApiNotificationRequest,
    InitialValuesMapper,
} from '@/interfaces';

export type { FormMode };

type ModalFormProps<TVariables> = FormProps<TVariables>;
type ModalFormFinishVariables<TVariables> = TVariables | FormData;

type RefineUseModalFormRequest<
    TQueryFnData extends BaseRecord,
    TVariables,
    TData extends BaseRecord,
> = NonNullable<Parameters<typeof useModalForm<TQueryFnData, HttpError, TVariables, TData>>[0]>;

type UseCustomModalRequest<
    TQueryFnData extends BaseRecord,
    TVariables,
    TData extends BaseRecord,
> = Omit<
    RefineUseModalFormRequest<TQueryFnData, ModalFormFinishVariables<TVariables>, TData>,
    'formProps' | 'onFinish' | 'errorNotification' | 'successNotification'
> &
    IBaseApiNotificationRequest &
    IBaseApiFormRequest<TQueryFnData, TVariables>;

type BaseModalFormReturnType = ReturnType<typeof useModalForm>;

export type UseCustomModalFormResponse<
    TQueryFnData extends BaseRecord = BaseRecord,
    TVariables = Record<string, never>,
    TData extends BaseRecord = TQueryFnData,
> = Omit<BaseModalFormReturnType, 'formProps'> & IBaseApiFormResponse<TVariables>;

export const useCustomModalForm = <
    TQueryFnData extends BaseRecord = BaseRecord,
    TVariables = Record<string, never>,
    TData extends BaseRecord = TQueryFnData,
>({
    action = 'create',
    resource,
    autoResetForm = true,
    redirect = false,
    warnWhenUnsavedChanges = false,
    errorDescription,
    errorMessage,
    errorNotification,
    successDescription,
    successMessage,
    successNotification,
    initialValuesMapper,
    onFinish,
    ...rest
}: UseCustomModalRequest<TQueryFnData, TVariables, TData>): UseCustomModalFormResponse<
    TQueryFnData,
    TVariables,
    TData
> => {
    const queryOptions: UseCustomModalRequest<TQueryFnData, TVariables, TData>['queryOptions'] = {
        ...rest.queryOptions,
        select: (response: GetOneResponse<TQueryFnData>): GetOneResponse<TData> => {
            const selectedResponse = rest.queryOptions?.select
                ? rest.queryOptions.select(response)
                : (response as unknown as GetOneResponse<TData>);

            const selectedData = selectedResponse?.data;
            if (!initialValuesMapper || !selectedData) {
                return selectedResponse;
            }

            return {
                ...selectedResponse,
                data: {
                    ...selectedData,
                    ...initialValuesMapper(selectedData as unknown as TQueryFnData),
                } as unknown as TData,
            };
        },
    };

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

    const modalForm = useModalForm<
        TQueryFnData,
        HttpError,
        ModalFormFinishVariables<TVariables>,
        TData
    >({
        ...rest,
        resource,
        queryOptions,
        action,
        autoResetForm,
        redirect,
        warnWhenUnsavedChanges,
        ...resolvedNotifications,
    });

    const customOnFinish = createFormFinishHandler<TVariables>(
        modalForm.formProps.onFinish,
        onFinish,
    );

    return {
        ...modalForm,
        resource,
        mode: action as FormMode,
        formProps: {
            ...modalForm.formProps,
            form: modalForm.formProps.form as unknown as FormInstance<TVariables>,
            onFinish: customOnFinish,
        } as ModalFormProps<TVariables>,
        saveButtonProps: createSaveButtonProps(undefined, modalForm.formProps.form),
    } as unknown as UseCustomModalFormResponse<TQueryFnData, TVariables, TData>;
};
