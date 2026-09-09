'use client';

import { Loading } from '@/components/common';
import { SocketProvider } from '@/contexts/SocketContext';
import { MessageType, NotificationType, Theme } from '@/enums';
import {
    IconType,
    NoticeType,
    useCustomMessage,
    useCustomNotification,
} from '@/components/custom-antd';
import { createContext, PropsWithChildren, useContext, useState } from 'react';

import { MainLayout } from '@/components/layout';

interface IMessageProps {
    content: string;
    duration?: number;
    type?: MessageType;
}

interface INotificationProps {
    message: string;
    duration?: number;
    description?: string;
    type?: NotificationType;
}

interface MainContextType {
    theme: Theme;
    loading: boolean;
    scrollToTop: () => void;
    handleTheme: (theme: Theme) => void;
    handleLoading: (loading: boolean) => void;
    handleMessage: (props: IMessageProps) => void;
    handleNotification: (props: INotificationProps) => void;
}

const MainContext = createContext<MainContextType | undefined>(undefined);

export const MainProvider = ({
    children,
    isPublic = false,
}: PropsWithChildren<{ isPublic?: boolean }>) => {
    const [loading, setLoading] = useState(false);
    const [theme, setTheme] = useState<Theme>(Theme.LIGHT);

    const [messageApi, messageContextHolder] = useCustomMessage();
    const [notificationApi, notificationContextHolder] = useCustomNotification();

    const handleLoading = (loading: boolean) => {
        setLoading(loading);
    };

    const handleMessage = (props: IMessageProps) => {
        const { content, type, duration } = props;

        const truncatedContent = content.length > 50 ? content.slice(0, 50) + ' ...' : content;

        messageApi.destroy();
        messageApi.open({
            content: truncatedContent,
            type: (type ?? MessageType.SUCCESS) as NoticeType,
            duration: (duration ?? 3) / 1000 > 0 ? (duration ?? 3000) / 1000 : 3,
        });
    };

    const handleNotification = (props: INotificationProps) => {
        const { message, description, type, duration } = props;

        const truncatedMessageText = message.length > 50 ? message.slice(0, 50) + ' ...' : message;

        notificationApi.destroy();
        notificationApi.open({
            description,
            message: truncatedMessageText,
            type: (type ?? 'success') as IconType,
            duration: (duration ?? 3) / 1000 > 0 ? (duration ?? 3000) / 1000 : 3,
        });
    };

    const handleTheme = (theme: Theme) => {
        setTheme(theme);
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
                    element.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (loading) return <Loading />;

    return (
        <MainContext.Provider
            value={{
                theme,
                loading,
                scrollToTop,
                handleTheme,
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
                <div className="animate-in fade-in duration-300">{children}</div>
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
