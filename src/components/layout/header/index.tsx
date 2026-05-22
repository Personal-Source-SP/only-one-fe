'use client';

import {
    CustomAvatar,
    CustomBadge,
    CustomButton,
    CustomDropdown,
    CustomFlex,
    MenuProps,
} from '@/components/custom';
import { KEY_SESSION_STORAGE } from '@/constants';
import { Icon } from '@iconify/react';
import { signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';

type HeaderProps = {
    pageDescription?: string;
    pageTitle?: string;
    mobileMenuOpen: boolean;
    showNotifications: boolean;
    sidebarCollapsed: boolean;
    onToggleSidebar: () => void;
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
    pageDescription,
    pageTitle,
    mobileMenuOpen,
    showNotifications,
    sidebarCollapsed,
    onToggleSidebar,
    setMobileMenuOpen,
    setShowNotifications,
}: HeaderProps) => {
    const pathname = usePathname();
    const router = useRouter();

    const settingItem: SettingItem[] = [
        {
            label: 'Thông tin tài khoản',
            icon: 'lucide:user',
            onClick: () => {},
        },
        {
            label: 'Cài đặt',
            icon: 'lucide:settings',
            onClick: () => router.push('/setting/appearance'),
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

    const renderPageHeading = () => {
        if (!pageTitle) {
            return null;
        }

        return (
            <div className="min-w-0 flex-1 md:max-w-[min(100%,28rem)] lg:max-w-[min(100%,36rem)]">
                <h1
                    className="!m-0 truncate text-base font-semibold text-hub-title sm:text-lg md:text-xl"
                    title={pageTitle}
                >
                    {pageTitle}
                </h1>
                {pageDescription && (
                    <p
                        className="!m-0 mt-0.5 line-clamp-1 text-xs text-hub-muted sm:text-sm max-md:hidden md:block"
                        title={pageDescription}
                    >
                        {pageDescription}
                    </p>
                )}
            </div>
        );
    };

    const renderNavbarLeft = () => {
        const sidebarToggleIcon = sidebarCollapsed
            ? 'lucide:panel-left-open'
            : 'lucide:panel-left-close';

        return (
            <CustomFlex align="center" className="min-w-0 flex-1 gap-2 md:gap-3">
                <CustomButton
                    touchFriendly
                    type="text"
                    shape="circle"
                    className="min-h-11 min-w-11 shrink-0 md:hidden"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    icon={<Icon icon="lucide:menu" className="text-xl" />}
                />
                <CustomButton
                    type="text"
                    shape="circle"
                    title={sidebarCollapsed ? 'Mở sidebar' : 'Thu gọn sidebar'}
                    className="hidden min-h-11 min-w-11 shrink-0 items-center justify-center text-hub-muted transition-colors hover:bg-hub-bg hover:text-hub-text md:inline-flex"
                    onClick={onToggleSidebar}
                    icon={<Icon icon={sidebarToggleIcon} className="text-xl" />}
                />
                {renderPageHeading()}
            </CustomFlex>
        );
    };

    const renderNavbarRight = () => {
        return (
            <CustomFlex align="center" gap={8} className="shrink-0 md:gap-4">
                <CustomBadge size="small" count={7}>
                    <CustomButton
                        type="text"
                        shape="circle"
                        onClick={() => setShowNotifications(!showNotifications)}
                        icon={<Icon icon="lucide:bell" className="text-xl text-hub-muted" />}
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
            data-hub-shell="header"
            className="z-30 flex h-14 shrink-0 items-center justify-between gap-3 bg-hub-surface px-4 max-md:fixed max-md:left-0 max-md:right-0 max-md:top-0 max-md:border-b max-md:border-hub-border md:relative md:z-10 md:h-16 md:overflow-hidden md:rounded-hub-shell md:border md:border-hub-border md:shadow-sm"
        >
            {renderNavbarLeft()}
            {renderNavbarRight()}
        </section>
    );
};
