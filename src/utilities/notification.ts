import type { HttpError, OpenNotificationParams } from '@refinedev/core';
import { normalizeResourceKey } from './resource';

/**
 * Pulls a human-readable message out of an error thrown by the data provider.
 */
const getBackendErrorMessage = (error?: HttpError | Error): string | undefined => {
    const message = error?.message?.trim();
    return message ? message : undefined;
};

export enum NotificationAction {
    Edit = 'edit',
    Load = 'load',
    Save = 'save',
    Clone = 'clone',
    Create = 'create',
    Delete = 'delete',
    Update = 'update',
}

export interface GetErrorNotificationRequest<TNotification = OpenNotificationParams | false> {
    message?: string;
    resource?: string;
    description?: string;
    action?: NotificationAction;
    errorNotification?: TNotification;
}

export interface GetSuccessNotificationRequest<TNotification = OpenNotificationParams | false> {
    message?: string;
    resource?: string;
    description?: string;
    action?: NotificationAction;
    successNotification?: TNotification;
}

export const getSuccessNotification = <TNotification = OpenNotificationParams | false>({
    message,
    action = NotificationAction.Save,
    resource,
    description,
    successNotification,
}: GetSuccessNotificationRequest<TNotification>): OpenNotificationParams | TNotification => {
    if (successNotification !== undefined) {
        return successNotification;
    }

    const resourceKey = normalizeResourceKey(resource);
    const defaultMessage =
        action === NotificationAction.Delete ? 'Xóa dữ liệu thành công' : 'Thao tác thành công';

    return {
        type: 'success',
        message: message ?? defaultMessage,
        ...(description === undefined ? {} : { description }),
    };
};

export const getErrorNotification = <TNotification = OpenNotificationParams | false>({
    message,
    action,
    resource,
    description,
    errorNotification,
}: GetErrorNotificationRequest<TNotification>): OpenNotificationParams | TNotification => {
    if (errorNotification !== undefined) {
        return errorNotification;
    }

    const defaultTitle = 'Đã có lỗi xảy ra';

    return ((error?: HttpError) => {
        const backendMessage = getBackendErrorMessage(error);
        const finalDescription = description ?? message ?? defaultTitle;

        return {
            type: 'error',
            message: backendMessage || message || defaultTitle,
            ...(finalDescription === undefined ? {} : { description: finalDescription }),
        };
    }) as TNotification;
};
