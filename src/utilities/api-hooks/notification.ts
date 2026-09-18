import type {
    ApiNotificationParam,
    CustomHttpMethod,
    FormMode,
    IBaseApiNotificationRequest,
} from '@/interfaces';
import type { SuccessErrorNotification } from '@refinedev/core';
import {
    getErrorNotification,
    getSuccessNotification,
    NotificationAction,
} from '@/utilities/notification';

const FORM_NOTIFICATION_ACTION: Record<FormMode, NotificationAction> = {
    edit: NotificationAction.Edit,
    clone: NotificationAction.Clone,
    create: NotificationAction.Create,
};

export const getFormNotificationAction = (mode: FormMode): NotificationAction => {
    return FORM_NOTIFICATION_ACTION[mode] ?? NotificationAction.Save;
};

const METHOD_NOTIFICATION_ACTION: Record<string, NotificationAction> = {
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

export interface ResolveMutationNotificationsParams<TData = any, TError = any, TVariables = any> {
    resource?: string;
    action?: NotificationAction;
    requestErrorNotification?: SuccessErrorNotification<
        TData,
        TError,
        TVariables
    >['errorNotification'];
    hookErrorNotification?: SuccessErrorNotification<
        TData,
        TError,
        TVariables
    >['errorNotification'];
    requestSuccessNotification?: SuccessErrorNotification<
        TData,
        TError,
        TVariables
    >['successNotification'];
    hookSuccessNotification?: SuccessErrorNotification<
        TData,
        TError,
        TVariables
    >['successNotification'];
}

/**
 * Resolves error and success notification configs with Request > Hook > Default precedence.
 */
export const resolveMutationNotifications = <TData = any, TError = any, TVariables = any>({
    resource,
    action = NotificationAction.Create,
    requestErrorNotification,
    hookErrorNotification,
    requestSuccessNotification,
    hookSuccessNotification,
}: ResolveMutationNotificationsParams<TData, TError, TVariables>) => {
    let errorNotification: SuccessErrorNotification<TData, TError, TVariables>['errorNotification'];
    if (requestErrorNotification !== undefined) {
        errorNotification = requestErrorNotification;
    } else if (hookErrorNotification !== undefined) {
        errorNotification = hookErrorNotification;
    } else {
        errorNotification = getErrorNotification({
            resource,
            action,
        });
    }

    let successNotification: SuccessErrorNotification<
        TData,
        TError,
        TVariables
    >['successNotification'];
    if (requestSuccessNotification !== undefined) {
        successNotification = requestSuccessNotification;
    } else if (hookSuccessNotification !== undefined) {
        successNotification = hookSuccessNotification;
    } else {
        successNotification = getSuccessNotification({
            resource,
            action,
        });
    }

    return {
        errorNotification,
        successNotification,
    };
};

/**
 * Resolves error notification for load/query operations.
 */
export const resolveQueryErrorNotification = <TData = any, TError = any>(
    params: IBaseApiNotificationRequest<TData, TError> & { action?: NotificationAction },
): ApiNotificationParam => {
    if (params.errorNotification !== undefined) {
        return params.errorNotification as ApiNotificationParam;
    }

    return getErrorNotification({
        resource: params.resource,
        action: params.action ?? NotificationAction.Load,
    });
};

/**
 * Resolves query notifications with error enabled and success disabled by default.
 */
export const resolveQueryNotifications = <TData = any, TError = any>(
    params: IBaseApiNotificationRequest<TData, TError> & { action?: NotificationAction },
): SuccessErrorNotification => ({
    errorNotification: resolveQueryErrorNotification(params),
    successNotification:
        (params.successNotification as SuccessErrorNotification['successNotification']) ?? false,
});

export interface ResolveFormNotificationsParams extends IBaseApiNotificationRequest {
    action?: FormMode | string;
}

/**
 * Resolves form notifications (error + success) mapped to FormMode action.
 */
export const resolveFormNotifications = ({
    resource,
    action = 'create',
    errorNotification,
    successNotification,
}: ResolveFormNotificationsParams): SuccessErrorNotification => {
    const notificationAction = getFormNotificationAction(action as FormMode);
    return {
        errorNotification: getErrorNotification({
            resource,
            errorNotification,
            action: notificationAction,
        }),
        successNotification: getSuccessNotification({
            resource,
            successNotification,
            action: notificationAction,
        }),
    };
};
