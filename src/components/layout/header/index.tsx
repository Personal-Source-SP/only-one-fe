'use client';

import { Icon } from '@iconify/react';
import { Avatar, Badge, Button, Dropdown, MenuProps } from 'antd';
import { signOut } from 'next-auth/react';
import { FC, memo } from 'react';

type HeaderProps = {
    showSearch: boolean;
    mobileMenuOpen: boolean;
    showNotifications: boolean;
    getPageTitle: () => string;
    setShowSearch: (show: boolean) => void;
    setMobileMenuOpen: (open: boolean) => void;
    setShowNotifications: (show: boolean) => void;
};

interface SettingItem {
    label: string;
    icon: string;
    disabled?: boolean;
    onClick: () => void;
}

const Header: FC<HeaderProps> = ({
    showSearch,
    mobileMenuOpen,
    showNotifications,
    getPageTitle,
    setShowSearch,
    setMobileMenuOpen,
    setShowNotifications,
}) => {
    const settingItem: SettingItem[] = [
        {
            label: 'Thông tin tài khoản',
            icon: 'lucide:user',
            onClick: () => {},
        },
        {
            label: 'Cài đặt',
            icon: 'lucide:settings',
            onClick: () => {},
        },
        {
            label: 'Đăng xuất',
            icon: 'lucide:log-out',
            onClick: () => {
                signOut({
                    redirect: true,
                    callbackUrl: '/login',
                });
            },
        },
    ];

    const renderNavbarLeft = () => {
        return (
            <div className="flex items-center">
                <Button
                    type="text"
                    shape="circle"
                    className="mr-2 md:hidden"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    icon={<Icon icon="lucide:menu" className="text-xl" />}
                />
                <h1 className="text-xl font-medium m-0">{getPageTitle()}</h1>
            </div>
        );
    };

    const renderNavbarRight = () => {
        const menuItems: MenuProps['items'] = settingItem.map((item) => ({
            key: item.label,
            disabled: item.disabled,
            label: (
                <div className="flex items-center gap-2" onClick={item.onClick}>
                    <Icon icon={item.icon} />
                    <span>{item.label}</span>
                </div>
            ),
        }));

        return (
            <div className="flex items-center gap-2 md:gap-4">
                <Button
                    type="text"
                    shape="circle"
                    className="md:hidden"
                    onClick={() => setShowSearch(!showSearch)}
                    icon={<Icon icon="lucide:search" className="text-xl text-foreground-600" />}
                />

                <div className="relative hidden md:block">
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        className="bg-content2 rounded-full py-2 pl-10 pr-4 w-64 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
                    />
                    <Icon
                        icon="lucide:search"
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-500"
                    />
                </div>

                <Badge size="small" count={7}>
                    <Button
                        type="text"
                        shape="circle"
                        onClick={() => setShowNotifications(!showNotifications)}
                        icon={<Icon icon="lucide:bell" className="text-xl text-foreground-600" />}
                    />
                </Badge>

                <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={['click']}>
                    <Avatar
                        size={32}
                        className="cursor-pointer"
                        src="https://img.heroui.chat/image/avatar?w=200&h=200&u=1"
                    />
                </Dropdown>
            </div>
        );
    };

    return (
        <section className="w-full border-b border-divider flex items-center justify-between px-4 py-2 bg-white">
            {renderNavbarLeft()}
            {renderNavbarRight()}
        </section>
    );
};

export default memo(Header);
