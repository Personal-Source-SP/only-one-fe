import type { ButtonProps, FormInstance } from '@/components/custom-antd';
import type {
    ApiNotificationParam,
    CustomHttpMethod,
    FormMode,
    IBaseApiNotificationRequest,
} from '@/interfaces';
import { getErrorNotification, getSuccessNotification, NotificationAction } from './notification';

/**
 * Resolves full API URL with base URL fallback.
 */
export const resolveApiUrl = (url: string, apiUrl: string): string => {
    return url.startsWith('http') || url.startsWith('/') ? url : `${apiUrl}/${url}`;
};

/**
 * Maps form action mode to standard notification action.
 */
export const FORM_NOTIFICATION_ACTION: Record<FormMode, NotificationAction> = {
    edit: NotificationAction.Edit,
    clone: NotificationAction.Clone,
    create: NotificationAction.Create,
};

export const getFormNotificationAction = (mode: FormMode): NotificationAction => {
    return FORM_NOTIFICATION_ACTION[mode] ?? NotificationAction.Save;
};

/**
 * Maps HTTP method to standard notification action.
 */
export const METHOD_NOTIFICATION_ACTION: Record<string, NotificationAction> = {
    post: NotificationAction.Create,
    delete: NotificationAction.Delete,
    put: NotificationAction.Update,
    patch: NotificationAction.Update,
    get: NotificationAction.Load,
};

export const getMethodNotificationAction = (
    method: CustomHttpMethod = 'post',
): NotificationAction => {
    return METHOD_NOTIFICATION_ACTION[method] ?? NotificationAction.Update;
};

export interface ResolveMutationNotificationsParams {
    resource?: string;
    action: NotificationAction;
    requestErrorNotification?: ApiNotificationParam;
    hookErrorNotification?: ApiNotificationParam;
    requestErrorMessage?: string;
    hookErrorMessage?: string;
    requestSuccessNotification?: ApiNotificationParam;
    hookSuccessNotification?: ApiNotificationParam;
    requestSuccessMessage?: string;
    hookSuccessMessage?: string;
}

/**
 * Resolves error and success notification configs with Request > Hook > Default precedence.
 */
export const resolveMutationNotifications = ({
    resource,
    action,
    requestErrorNotification,
    hookErrorNotification,
    requestErrorMessage,
    hookErrorMessage,
    requestSuccessNotification,
    hookSuccessNotification,
    requestSuccessMessage,
    hookSuccessMessage,
}: ResolveMutationNotificationsParams) => {
    let errorNotification: ApiNotificationParam;
    if (requestErrorNotification !== undefined) {
        errorNotification = requestErrorNotification;
    } else if (hookErrorNotification !== undefined) {
        errorNotification = hookErrorNotification;
    } else {
        errorNotification = getErrorNotification({
            resource,
            action,
            message: requestErrorMessage ?? hookErrorMessage,
        });
    }

    let successNotification: ApiNotificationParam;
    if (requestSuccessNotification !== undefined) {
        successNotification = requestSuccessNotification;
    } else if (hookSuccessNotification !== undefined) {
        successNotification = hookSuccessNotification;
    } else {
        successNotification = getSuccessNotification({
            resource,
            action,
            message: requestSuccessMessage ?? hookSuccessMessage,
        });
    }

    return {
        errorNotification,
        successNotification,
    };
};

/**
 * Unwraps standard backend API envelope ({ isSuccess, data, meta, errors }).
 */
export const unwrapApiResponse = <T = any>(rawResponse: any): T | undefined => {
    if (!rawResponse) return undefined;
    if (
        rawResponse?.data !== undefined &&
        (rawResponse?.isSuccess !== undefined ||
            rawResponse?.errors !== undefined ||
            rawResponse?.meta !== undefined)
    ) {
        return rawResponse.data;
    }
    return rawResponse?.data !== undefined ? rawResponse.data : rawResponse;
};

/**
 * Applies data transformation with safe fallback.
 */
export const applyDataTransform = <TData, TTransformed>(
    data: TData | undefined,
    rawResponse?: any,
    transform?: (data: TData | undefined, rawResponse?: any) => TTransformed,
): TTransformed => {
    if (transform) {
        return transform(data, rawResponse);
    }
    return data as unknown as TTransformed;
};

/**
 * Resolves error notification for load/query operations.
 */
export const resolveQueryErrorNotification = (
    params: IBaseApiNotificationRequest & { action?: NotificationAction },
): ApiNotificationParam => {
    if (params.errorNotification !== undefined) {
        return params.errorNotification;
    }
    return getErrorNotification({
        resource: params.resource,
        message: params.errorMessage,
        description: params.errorDescription,
        action: params.action ?? NotificationAction.Load,
    });
};

/**
 * Creates save button props with form submit binding.
 */
export const createSaveButtonProps = (
    saveButtonProps: ButtonProps | undefined,
    form: FormInstance | undefined,
): ButtonProps & { onClick: () => void } => ({
    ...saveButtonProps,
    onClick: () => {
        form?.submit();
    },
});

/**
 * Creates form finish handler wrapping custom and original onFinish.
 */
export const createFormFinishHandler = <TVariables>(
    originalOnFinish: ((values: any) => Promise<any> | any) | undefined,
    customOnFinish?: (
        values: TVariables,
    ) => Promise<TVariables | FormData | void> | TVariables | FormData | void,
) => {
    return async (values: TVariables) => {
        if (customOnFinish) {
            const result = await customOnFinish(values);
            if (result) {
                return originalOnFinish?.(result);
            }
            return;
        }
        return originalOnFinish?.(values);
    };
};
