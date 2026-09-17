import {
    createFormFinishHandler,
    createSaveButtonProps,
    resolveFormNotifications,
} from '@/utilities';

import { useDrawerForm } from '@refinedev/antd';
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

type DrawerFormProps<TVariables> = FormProps<TVariables>;
type DrawerFormFinishVariables<TVariables> = TVariables | FormData;

type RefineUseDrawerFormRequest<
    TQueryFnData extends BaseRecord,
    TVariables,
    TData extends BaseRecord,
> = NonNullable<Parameters<typeof useDrawerForm<TQueryFnData, HttpError, TVariables, TData>>[0]>;

type UseCustomDrawerRequest<
    TQueryFnData extends BaseRecord,
    TVariables,
    TData extends BaseRecord,
> = Omit<
    RefineUseDrawerFormRequest<TQueryFnData, DrawerFormFinishVariables<TVariables>, TData>,
    'formProps' | 'onFinish' | 'errorNotification' | 'successNotification'
> &
    IBaseApiNotificationRequest &
    IBaseApiFormRequest<TQueryFnData, TVariables>;

type BaseDrawerFormReturnType = ReturnType<typeof useDrawerForm>;

export type UseCustomDrawerFormResponse<
    TQueryFnData extends BaseRecord = BaseRecord,
    TVariables = Record<string, never>,
    TData extends BaseRecord = TQueryFnData,
> = Omit<BaseDrawerFormReturnType, 'formProps'> & IBaseApiFormResponse<TVariables>;

export const useCustomDrawerForm = <
    TQueryFnData extends BaseRecord = BaseRecord,
    TVariables = Record<string, never>,
    TData extends BaseRecord = TQueryFnData,
>({
    resource,
    action = 'create',
    redirect = false,
    autoResetForm = true,
    warnWhenUnsavedChanges = false,
    errorNotification,
    successNotification,
    initialValuesMapper,
    onFinish,
    ...rest
}: UseCustomDrawerRequest<TQueryFnData, TVariables, TData>): UseCustomDrawerFormResponse<
    TQueryFnData,
    TVariables,
    TData
> => {
    const queryOptions: UseCustomDrawerRequest<TQueryFnData, TVariables, TData>['queryOptions'] = {
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
        errorNotification,
        successNotification,
    });

    const drawerForm = useDrawerForm<
        TQueryFnData,
        HttpError,
        DrawerFormFinishVariables<TVariables>,
        TData
    >({
        ...rest,
        action,
        resource,
        redirect,
        queryOptions,
        autoResetForm,
        warnWhenUnsavedChanges,
        ...resolvedNotifications,
    });

    const customOnFinish = createFormFinishHandler<TVariables>(
        drawerForm.formProps.onFinish,
        onFinish,
    );

    return {
        ...drawerForm,
        resource,
        mode: action as FormMode,
        formProps: {
            ...drawerForm.formProps,
            form: drawerForm.formProps.form as unknown as FormInstance<TVariables>,
            onFinish: customOnFinish,
        } as DrawerFormProps<TVariables>,
        saveButtonProps: createSaveButtonProps(
            drawerForm.saveButtonProps,
            drawerForm.formProps.form,
        ),
        isLoading: Boolean(drawerForm.formLoading),
    } as unknown as UseCustomDrawerFormResponse<TQueryFnData, TVariables, TData>;
};
