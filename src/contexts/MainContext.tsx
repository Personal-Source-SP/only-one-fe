'use client';

import { Loading } from '@/components/common';
import MainLayout from '@/components/layout';
import { message, notification } from 'antd';

import { createContext, FC, PropsWithChildren, useContext, useState } from 'react';

type NotificationType = 'success' | 'info' | 'warning' | 'error';
type MessageType = 'success' | 'error' | 'info' | 'warning' | 'loading';

interface MainContextType {
    loading: boolean;
    handleLoading: (loading: boolean) => void;
    handleMessage: (content: string, type?: MessageType, duration?: number) => void;
    handleNotification: (
        message: string,
        description?: string,
        type?: NotificationType,
        duration?: number,
    ) => void;
}

type MainProviderProps = PropsWithChildren<{
    isPublic?: boolean;
}>;

const MainContext = createContext<MainContextType | undefined>(undefined);

export const MainProvider: FC<MainProviderProps> = ({ children, isPublic = false }) => {
    const [loading, setLoading] = useState(false);

    const [messageApi, messageContextHolder] = message.useMessage();
    const [notificationApi, notificationContextHolder] = notification.useNotification();

    const handleLoading = (loading: boolean) => {
        setLoading(loading);
    };

    const handleMessage = (content: string, type?: MessageType, duration?: number) => {
        const truncatedContent = content.length > 50 ? content.slice(0, 50) + ' ...' : content;

        messageApi.destroy();
        messageApi.open({
            content: truncatedContent,
            type: type ?? 'success',
            duration: (duration ?? 3) / 1000 > 0 ? (duration ?? 3000) / 1000 : 3,
        });
    };

    const handleNotification = (
        messageText: string,
        description?: string,
        type?: NotificationType,
        duration?: number,
    ) => {
        const truncatedMessageText =
            messageText.length > 50 ? messageText.slice(0, 50) + ' ...' : messageText;

        notificationApi.destroy();
        notificationApi.open({
            message: truncatedMessageText,
            description,
            type: type ?? 'success',
            duration: (duration ?? 3) / 1000 > 0 ? (duration ?? 3000) / 1000 : 3,
        });
    };

    if (loading) return <Loading />;

    return (
        <MainContext.Provider
            value={{
                loading,
                handleLoading,
                handleMessage,
                handleNotification,
            }}
        >
            {/* Message */}
            {messageContextHolder}

            {/* Notification */}
            {notificationContextHolder}

            {isPublic ? children : <MainLayout>{children}</MainLayout>}
        </MainContext.Provider>
    );
};

export const useMainContext = () => {
    const context = useContext(MainContext);

    if (context === undefined) {
        throw new Error('useMainContext must be used within an MainProvider');
    }

    return context;
};
