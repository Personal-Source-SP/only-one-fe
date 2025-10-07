'use client';

import { Icon } from '@iconify/react';
import { Avatar, Button, Card, Space } from 'antd';
import { FC, memo, useState } from 'react';

interface Notification {
    id: number;
    time: string;
    title: string;
    read: boolean;
    message: string;
    type: 'share' | 'comment' | 'mention' | 'update';
    user: {
        name: string;
        avatar: string;
    };
}

type NotificationsPanelProps = {
    onClose: () => void;
    notifications: Notification[];
};

const NotificationsPanel: FC<NotificationsPanelProps> = ({ notifications, onClose }) => {
    const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

    const filteredNotifications =
        activeTab === 'all' ? notifications : notifications.filter((n) => !n.read);

    const getIcon = (type: string) => {
        switch (type) {
            case 'share':
                return <Icon icon="lucide:share-2" className="text-primary" />;
            case 'comment':
                return <Icon icon="lucide:message-circle" className="text-success" />;
            case 'mention':
                return <Icon icon="lucide:at-sign" className="text-warning" />;
            case 'update':
                return <Icon icon="lucide:refresh-cw" className="text-secondary" />;
            default:
                return <Icon icon="lucide:bell" className="text-foreground-500" />;
        }
    };

    return (
        <Space direction="vertical" className="fixed top-16 right-4 z-50 w-full max-w-sm">
            <Card className="shadow-lg">
                <div className="p-4 border-b border-divider flex justify-between items-center">
                    <h3 className="text-lg font-medium">Thông báo</h3>
                    <Button
                        type="text"
                        size="small"
                        onClick={onClose}
                        icon={<Icon icon="lucide:x" className="text-lg" />}
                    />
                </div>

                <div className="p-2 border-b border-divider flex">
                    <Button
                        size="small"
                        className="flex-1 rounded-r-none"
                        type={activeTab === 'all' ? 'primary' : 'default'}
                        onClick={() => setActiveTab('all')}
                    >
                        Tất cả
                    </Button>
                    <Button
                        size="small"
                        className="flex-1 rounded-l-none"
                        type={activeTab === 'unread' ? 'primary' : 'default'}
                        onClick={() => setActiveTab('unread')}
                    >
                        Chưa đọc
                    </Button>
                </div>

                <div className="max-h-96 overflow-y-auto">
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-4 border-b border-divider hover:bg-content2 cursor-pointer ${
                                    !notification.read ? 'bg-primary-50' : ''
                                }`}
                            >
                                <div className="flex">
                                    <Avatar
                                        size={40}
                                        className="mr-3"
                                        src={notification.user.avatar}
                                    />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <p className="font-medium">{notification.title}</p>
                                            <div className="flex items-center">
                                                <span className="text-xs text-foreground-500">
                                                    {notification.time}
                                                </span>
                                                {!notification.read && (
                                                    <div className="ml-2 w-2 h-2 rounded-full bg-primary"></div>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-sm text-foreground-600 mt-1">
                                            {notification.message}
                                        </p>
                                        <div className="mt-2 flex items-center">
                                            {getIcon(notification.type)}
                                            <span className="text-xs text-foreground-500 ml-1">
                                                {notification.type === 'share' && 'Chia sẻ'}
                                                {notification.type === 'comment' && 'Bình luận'}
                                                {notification.type === 'mention' && 'Nhắc đến bạn'}
                                                {notification.type === 'update' && 'Cập nhật'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center">
                            <Icon
                                icon="lucide:check-circle"
                                className="text-4xl text-foreground-300 mx-auto mb-2"
                            />
                            <p className="text-foreground-500">Không có thông báo nào</p>
                        </div>
                    )}
                </div>

                <div className="p-3 border-t border-divider">
                    <Button type="primary" className="w-full" size="small">
                        Đánh dấu tất cả là đã đọc
                    </Button>
                </div>
            </Card>
        </Space>
    );
};

export default memo(NotificationsPanel);
