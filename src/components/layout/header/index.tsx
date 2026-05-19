import {
    CustomAvatar,
    CustomBadge,
    CustomButton,
    CustomDropdown,
    CustomFlex,
    CustomInput,
    MenuProps,
} from '@/components/custom';
import { KEY_SESSION_STORAGE } from '@/constants';
import { Icon } from '@iconify/react';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

import { Breadcrumb } from '@/components/layout/breadcrumb';
import { getPageTitle } from '@/libs';

type HeaderProps = {
    showSearch: boolean;
    mobileMenuOpen: boolean;
    showNotifications: boolean;
    sidebarCollapsed?: boolean;
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

export const Header = ({
    showSearch,
    mobileMenuOpen,
    showNotifications,
    sidebarCollapsed = false,
    setShowSearch,
    setMobileMenuOpen,
    setShowNotifications,
}: HeaderProps) => {
    const pathname = usePathname();

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
                sessionStorage.setItem(KEY_SESSION_STORAGE.RETURN_URL, pathname);
                signOut({
                    redirect: true,
                    callbackUrl: '/login',
                });
            },
        },
    ];

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

    const renderNavbarLeft = () => {
        return (
            <CustomFlex align="center">
                <Breadcrumb />
                <CustomButton
                    type="text"
                    shape="circle"
                    className="mr-2 md:hidden"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    icon={<Icon icon="lucide:menu" className="text-xl" />}
                />
                <h1 className="md:hidden text-xl font-medium m-0">{getPageTitle(pathname)}</h1>
            </CustomFlex>
        );
    };

    const renderNavbarRight = () => {
        return (
            <CustomFlex align="center" gap={8} className="md:gap-4">
                <CustomButton
                    type="text"
                    shape="circle"
                    className="md:hidden"
                    onClick={() => setShowSearch(!showSearch)}
                    icon={<Icon icon="lucide:search" className="text-xl text-foreground-600" />}
                />

                <div className="relative hidden md:block">
                    <CustomInput
                        type="text"
                        placeholder="Tìm kiếm..."
                        className="bg-content2 rounded-full py-2 pl-10 pr-4 w-64 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
                    />
                </div>

                <CustomBadge size="small" count={7}>
                    <CustomButton
                        type="text"
                        shape="circle"
                        onClick={() => setShowNotifications(!showNotifications)}
                        icon={<Icon icon="lucide:bell" className="text-xl text-foreground-600" />}
                    />
                </CustomBadge>

                <CustomDropdown
                    menu={{ items: menuItems }}
                    placement="bottomRight"
                    trigger={['click']}
                >
                    <CustomAvatar
                        size={32}
                        className="cursor-pointer"
                        src="https://img.heroui.chat/image/avatar?w=200&h=200&u=1"
                    />
                </CustomDropdown>
            </CustomFlex>
        );
    };

    return (
        <section
            className={`h-16 flex items-center justify-between px-4 bg-white fixed top-0 z-40 ${
                sidebarCollapsed ? 'md:left-16 md:right-0' : 'md:left-64 md:right-0'
            } left-0 right-0 border-b`}
        >
            {renderNavbarLeft()}
            {renderNavbarRight()}
        </section>
    );
};
