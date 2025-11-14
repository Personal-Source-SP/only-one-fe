'use client';

import { NotificationTab, NotificationType } from '@/enums';
import { useTableContainer } from '@/hooks';
import { Notification } from '@/interfaces';
import { formatDate } from '@/libs';
import { Icon } from '@iconify/react';
import { CrudFilter } from '@refinedev/core';
import { Avatar, Button, Card, Space } from 'antd';
import { FC, Fragment, memo, ReactNode, useEffect, useMemo, useState } from 'react';

const notificationIcon: Record<NotificationType, ReactNode> = {
    [NotificationType.INFO]: <Icon icon="lucide:share-2" className="text-primary" />,
    [NotificationType.ERROR]: <Icon icon="lucide:message-circle" className="text-success" />,
    [NotificationType.WARNING]: <Icon icon="lucide:at-sign" className="text-warning" />,
    [NotificationType.UPDATE]: <Icon icon="lucide:refresh-cw" className="text-secondary" />,
};

const notificationText: Record<NotificationType, string> = {
    [NotificationType.INFO]: 'Thông tin',
    [NotificationType.ERROR]: 'Lỗi',
    [NotificationType.WARNING]: 'Cảnh báo',
    [NotificationType.UPDATE]: 'Cập nhật',
};

const renderNotification = (notification: Notification) => {
    return (
        <div
            key={notification.id}
            className={`p-4 border-b border-divider hover:bg-content2 cursor-pointer ${
                !notification.isRead ? 'bg-primary-50' : ''
            }`}
        >
            <div className="flex">
                <Avatar size={40} className="mr-3" src={notification.createdBy} />
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <p className="font-medium">{notification.title}</p>
                        <div className="flex items-center">
                            <span className="text-xs text-foreground-500">
                                {formatDate(notification.createdAt)}
                            </span>
                            {!notification.isRead && (
                                <div className="ml-2 w-2 h-2 rounded-full bg-primary"></div>
                            )}
                        </div>
                    </div>
                    <p className="text-sm text-foreground-600 mt-1">{notification.description}</p>
                    <div className="mt-2 flex items-center">
                        {notificationIcon[notification.type]}
                        <span className="text-xs text-foreground-500 ml-1">
                            {notificationText[notification.type]}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

type NotificationsPanelProps = {
    onClose: () => void;
};

const NotificationsPanel: FC<NotificationsPanelProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<NotificationTab>(NotificationTab.ALL);

    const tableContainerData = useTableContainer({
        resource: 'notifications',
    });

    useEffect(() => {
        const filter: CrudFilter[] = [];

        if (activeTab === NotificationTab.UNREAD) {
            filter.push({
                field: 'isRead',
                operator: 'eq',
                value: false,
            });
        }

        tableContainerData.setCurrentPage(1);
        tableContainerData.setFilters(filter);
    }, [activeTab]);

    const filterNotifications = useMemo(() => {
        const notifications = tableContainerData.tableQuery?.data?.data as Notification[];
        if (!notifications) return [];

        return notifications;
    }, [tableContainerData.tableQuery?.data?.data]);

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
                        onClick={() => setActiveTab(NotificationTab.ALL)}
                        type={activeTab === NotificationTab.ALL ? 'primary' : 'default'}
                    >
                        Tất cả
                    </Button>
                    <Button
                        size="small"
                        className="flex-1 rounded-l-none"
                        onClick={() => setActiveTab(NotificationTab.UNREAD)}
                        type={activeTab === NotificationTab.UNREAD ? 'primary' : 'default'}
                    >
                        Chưa đọc
                    </Button>
                </div>

                <div className="max-h-96 overflow-y-auto">
                    {filterNotifications.length > 0 ? (
                        filterNotifications.map((notification) => (
                            <Fragment key={notification.id}>
                                {renderNotification(notification)}
                            </Fragment>
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
