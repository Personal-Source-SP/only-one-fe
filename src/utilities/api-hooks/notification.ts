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

export interface ResolveMutationNotificationsParams {
    resource?: string;
    action?: NotificationAction;
    requestErrorNotification?: ApiNotificationParam;
    hookErrorNotification?: ApiNotificationParam;
    requestSuccessNotification?: ApiNotificationParam;
    hookSuccessNotification?: ApiNotificationParam;
}

/**
 * Resolves error and success notification configs with Request > Hook > Default precedence.
 */
export const resolveMutationNotifications = ({
    resource,
    action = NotificationAction.Create,
    requestErrorNotification,
    hookErrorNotification,
    requestSuccessNotification,
    hookSuccessNotification,
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
export const resolveQueryErrorNotification = (
    params: IBaseApiNotificationRequest & { action?: NotificationAction },
): ApiNotificationParam => {
    if (params.errorNotification !== undefined) {
        return params.errorNotification;
    }

    return getErrorNotification({
        resource: params.resource,
        action: params.action ?? NotificationAction.Load,
    });
};

/**
 * Resolves query notifications with error enabled and success disabled by default.
 */
export const resolveQueryNotifications = (
    params: IBaseApiNotificationRequest & { action?: NotificationAction },
): SuccessErrorNotification => ({
    errorNotification: resolveQueryErrorNotification(params),
    successNotification: params.successNotification ?? false,
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
