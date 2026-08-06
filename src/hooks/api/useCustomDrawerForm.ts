import { getErrorNotification, getSuccessNotification, NotificationAction } from '@/utilities';
import { useDrawerForm } from '@refinedev/antd';
import type { BaseRecord, GetOneResponse, HttpError } from '@refinedev/core';
import type { ButtonProps, FormInstance, FormProps } from '@/components/custom';

export type FormMode = 'create' | 'edit' | 'clone';

type DrawerFormProps<TVariables> = FormProps<TVariables>;
type DrawerFormFinishVariables<TVariables> = TVariables | FormData;

type RefineUseDrawerFormRequest<
    TQueryFnData extends BaseRecord,
    TVariables,
    TData extends BaseRecord,
> = NonNullable<Parameters<typeof useDrawerForm<TQueryFnData, HttpError, TVariables, TData>>[0]>;

type InitialValuesMapper<TQueryFnData extends BaseRecord, TVariables> = (
    data: TQueryFnData,
) => Partial<TVariables>;

type UseCustomDrawerRequest<
    TQueryFnData extends BaseRecord,
    TVariables,
    TData extends BaseRecord,
> = Omit<
    RefineUseDrawerFormRequest<TQueryFnData, DrawerFormFinishVariables<TVariables>, TData>,
    'formProps' | 'onFinish'
> & {
    formProps?: FormProps<TVariables>;
    errorDescription?: string;
    errorMessage?: string;
    successDescription?: string;
    successMessage?: string;
    initialValuesMapper?: InitialValuesMapper<TQueryFnData, TVariables>;
    onFinish?: (
        values: TVariables,
    ) => Promise<TVariables | FormData | void> | TVariables | FormData | void;
};

type BaseDrawerFormReturnType = ReturnType<typeof useDrawerForm>;

export type UseCustomDrawerFormResponse<
    TQueryFnData extends BaseRecord = BaseRecord,
    TVariables = Record<string, never>,
    TData extends BaseRecord = TQueryFnData,
> = Omit<BaseDrawerFormReturnType, 'formProps'> & {
    mode: FormMode;
    resource?: string;
    formProps: DrawerFormProps<TVariables>;
    saveButtonProps: ButtonProps & { onClick: () => void };
};

const FORM_NOTIFICATION_ACTION: Record<string, NotificationAction> = {
    edit: NotificationAction.Edit,
    clone: NotificationAction.Clone,
    create: NotificationAction.Create,
};

export const useCustomDrawerForm = <
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

    const drawerForm = useDrawerForm<
        TQueryFnData,
        HttpError,
        DrawerFormFinishVariables<TVariables>,
        TData
    >({
        ...rest,
        resource,
        queryOptions,
        action,
        autoResetForm,
        redirect,
        warnWhenUnsavedChanges,
        errorNotification: getErrorNotification({
            resource,
            errorNotification,
            message: errorMessage,
            description: errorDescription,
            action: FORM_NOTIFICATION_ACTION[action ?? ''] ?? NotificationAction.Save,
        }),
        successNotification: getSuccessNotification({
            resource,
            successNotification,
            message: successMessage,
            description: successDescription,
            action: FORM_NOTIFICATION_ACTION[action ?? ''] ?? NotificationAction.Save,
        }),
    });

    const originalOnFinish = drawerForm.formProps.onFinish;
    const customOnFinish = async (values: TVariables) => {
        if (onFinish) {
            const result = await onFinish(values);
            if (result) {
                return originalOnFinish?.(result as DrawerFormFinishVariables<TVariables>);
            }
        }
        return originalOnFinish?.(values);
    };

    return {
        ...drawerForm,
        resource,
        mode: action as FormMode,
        formProps: {
            ...drawerForm.formProps,
            form: drawerForm.formProps.form as unknown as FormInstance<TVariables>,
            onFinish: customOnFinish,
        } as DrawerFormProps<TVariables>,
    } as unknown as UseCustomDrawerFormResponse<TQueryFnData, TVariables, TData>;
};
