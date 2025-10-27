import { App } from 'antd';
import { useCallback } from 'react';

type MessageType = 'success' | 'error' | 'info' | 'warning' | 'loading';

type MessageConfig = {
    content: string;
    duration?: number;
    onClose?: () => void;
};

type LoadingMessageConfig = {
    content: string;
    duration?: number;
    onClose?: () => void;
};

export const useMessage = () => {
    const { message } = App.useApp();

    const showMessage = useCallback(
        (type: MessageType, config: MessageConfig) => {
            return message[type](config);
        },
        [message],
    );

    const success = useCallback(
        (content: string, duration?: number) => {
            return message.success({ content, duration });
        },
        [message],
    );

    const error = useCallback(
        (content: string, duration?: number) => {
            return message.error({ content, duration });
        },
        [message],
    );

    const info = useCallback(
        (content: string, duration?: number) => {
            return message.info({ content, duration });
        },
        [message],
    );

    const warning = useCallback(
        (content: string, duration?: number) => {
            return message.warning({ content, duration });
        },
        [message],
    );

    const loading = useCallback(
        (content: string, duration?: number) => {
            return message.loading({ content, duration });
        },
        [message],
    );

    const destroy = useCallback(() => {
        message.destroy();
    }, [message]);

    return {
        showMessage,
        success,
        error,
        info,
        warning,
        loading,
        destroy,
    };
};
