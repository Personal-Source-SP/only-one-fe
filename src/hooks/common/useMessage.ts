import { useCallback } from 'react';

import { useCustomApp } from '@/components';
import { MessageType } from '@/enums';

export const useMessage = () => {
    const { message, notification } = useCustomApp();

    const handleMessage = useCallback(
        ({ content, type = MessageType.SUCCESS }: { content: string; type?: MessageType }) => {
            switch (type) {
                case MessageType.SUCCESS:
                    message.success(content);
                    break;
                case MessageType.ERROR:
                    message.error(content);
                    break;
                case MessageType.INFO:
                    message.info(content);
                    break;
                case MessageType.WARNING:
                    message.warning(content);
                    break;
                default:
                    message.info(content);
                    break;
            }
        },
        [message],
    );

    const handleNotification = useCallback(
        ({
            title,
            description,
            type = MessageType.SUCCESS,
        }: {
            title: string;
            description?: string;
            type?: MessageType;
        }) => {
            switch (type) {
                case MessageType.SUCCESS:
                    notification.success({ message: title, description });
                    break;
                case MessageType.ERROR:
                    notification.error({ message: title, description });
                    break;
                case MessageType.INFO:
                    notification.info({ message: title, description });
                    break;
                case MessageType.WARNING:
                    notification.warning({ message: title, description });
                    break;
                default:
                    notification.info({ message: title, description });
                    break;
            }
        },
        [notification],
    );

    return { handleMessage, handleNotification };
};
