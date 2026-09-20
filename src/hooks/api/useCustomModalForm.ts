import { useModalForm } from '@refinedev/antd';
import type { BaseRecord, GetOneResponse, HttpError } from '@refinedev/core';

import type { ButtonProps, FormInstance, FormProps } from '@/components';
import type {
    FormMode,
    IBaseApiFormRequest,
    IBaseApiFormResponse,
    IBaseApiNotificationRequest,
    InitialValuesMapper,
} from '@/interfaces';
import {
    createFormFinishHandler,
    createSaveButtonProps,
    resolveFormNotifications,
} from '@/utilities';

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
    errorNotification,
    successNotification,
    initialValuesMapper,
    onFinish,
    ...rest
}: UseCustomModalRequest<TQueryFnData, TVariables, TData>): UseCustomModalFormResponse<
    TQueryFnData,
    TVariables,
    TData
> => {
    const queryOptions: UseCustomModalRequest<TQueryFnData, TVariables, TData>['queryOptions'] =
        initialValuesMapper
            ? {
                  ...rest.queryOptions,
                  select: (response: GetOneResponse<TQueryFnData>): GetOneResponse<TData> => {
                      const data = response?.data;
                      if (!data) {
                          return response as unknown as GetOneResponse<TData>;
                      }

                      return {
                          ...response,
                          data: {
                              ...data,
                              ...initialValuesMapper(data),
                          } as unknown as TData,
                      };
                  },
              }
            : rest.queryOptions;

    const resolvedNotifications = resolveFormNotifications({
        resource,
        action,
        errorNotification,
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

    return {
        ...modalForm,
        resource,
        mode: action as FormMode,
        isLoading: Boolean(modalForm.formLoading),
        saveButtonProps: createSaveButtonProps(undefined, modalForm.formProps.form),
        formProps: {
            ...modalForm.formProps,
            form: modalForm.formProps.form as unknown as FormInstance<TVariables>,
            onFinish: createFormFinishHandler<TVariables>(modalForm.formProps.onFinish, onFinish),
        } as ModalFormProps<TVariables>,
    } as unknown as UseCustomModalFormResponse<TQueryFnData, TVariables, TData>;
};
