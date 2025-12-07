'use client';

import { Loading } from '@/components/common';
import MainLayout from '@/components/layout';
import { SocketProvider } from '@/contexts/SocketContext';
import { message, notification } from 'antd';

import { createContext, Fragment, PropsWithChildren, useContext, useState } from 'react';

type NotificationType = 'success' | 'info' | 'warning' | 'error';
type MessageType = 'success' | 'error' | 'info' | 'warning' | 'loading';

interface IMessageProps {
    content: string;
    type?: MessageType;
    duration?: number;
}

interface INotificationProps {
    message: string;
    description?: string;
    type?: NotificationType;
    duration?: number;
}

interface MainContextType {
    loading: boolean;
    scrollToTop: () => void;
    handleLoading: (loading: boolean) => void;
    handleMessage: (props: IMessageProps) => void;
    handleNotification: (props: INotificationProps) => void;
}

type MainProviderProps = PropsWithChildren<{
    isPublic?: boolean;
}>;

const MainContext = createContext<MainContextType | undefined>(undefined);

export const MainProvider = ({ children, isPublic = false }: MainProviderProps) => {
    const [loading, setLoading] = useState(false);

    const [messageApi, messageContextHolder] = message.useMessage();
    const [notificationApi, notificationContextHolder] = notification.useNotification();

    const handleLoading = (loading: boolean) => {
        setLoading(loading);
    };

    const handleMessage = (props: IMessageProps) => {
        const { content, type, duration } = props;

        const truncatedContent = content.length > 50 ? content.slice(0, 50) + ' ...' : content;

        messageApi.destroy();
        messageApi.open({
            content: truncatedContent,
            type: type ?? 'success',
            duration: (duration ?? 3) / 1000 > 0 ? (duration ?? 3000) / 1000 : 3,
        });
    };

    const handleNotification = (props: INotificationProps) => {
        const { message, description, type, duration } = props;

        const truncatedMessageText = message.length > 50 ? message.slice(0, 50) + ' ...' : message;

        notificationApi.destroy();
        notificationApi.open({
            description,
            type: type ?? 'success',
            message: truncatedMessageText,
            duration: (duration ?? 3) / 1000 > 0 ? (duration ?? 3000) / 1000 : 3,
        });
    };

    const scrollToTop = () => {
        const mainContentElement = document.querySelector('main.overflow-y-auto');

        if (mainContentElement) {
            mainContentElement.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        } else {
            const scrollableElements = [document.documentElement, document.body];

            scrollableElements.forEach((element) => {
                if (element instanceof HTMLElement) {
                    element.scrollTo({
                        top: 0,
                        behavior: 'smooth',
                    });
                }
            });

            window.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        }
    };

    if (loading) return <Loading />;

    return (
        <MainContext.Provider
            value={{
                loading,
                scrollToTop,
                handleLoading,
                handleMessage,
                handleNotification,
            }}
        >
            {/* Message */}
            {messageContextHolder}

            {/* Notification */}
            {notificationContextHolder}

            {isPublic ? (
                <Fragment>{children}</Fragment>
            ) : (
                <SocketProvider>
                    <MainLayout>{children}</MainLayout>
                </SocketProvider>
            )}
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
