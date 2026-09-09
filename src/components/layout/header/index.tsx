'use client';

import {
    CustomAvatar,
    CustomBadge,
    CustomButton,
    CustomDropdown,
    CustomFlex,
    MenuProps,
} from '@/components/custom-antd';
import { KEY_SESSION_STORAGE } from '@/constants';
import { Icon } from '@iconify/react';
import { signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';

import { getSectionTabs } from '@/libs';
import { useMemo } from 'react';

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
    const router = useRouter();
    const pathname = usePathname();

    const tabs = useMemo(() => getSectionTabs(pathname), [pathname]);

    const activeTab = useMemo(
        () => tabs?.find((tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`)),
        [pathname, tabs],
    );

    const settingItem = useMemo<SettingItem[]>(
        () => [
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
        ],
        [pathname, router],
    );

    const menuItems = useMemo<MenuProps['items']>(() => {
        const items = settingItem.map((item) => ({
            key: item.label,
            disabled: item.disabled,
            label: (
                <div className="flex items-center gap-2" onClick={item.onClick}>
                    <Icon icon={item.icon} />
                    <span>{item.label}</span>
                </div>
            ),
        }));
        return items;
    }, [settingItem]);

    const sectionDropdownItems = useMemo<MenuProps['items']>(() => {
        if (!tabs || tabs.length <= 1) return [];
        const items = tabs.map((tab) => {
            const isActive = tab.href === activeTab?.href;
            return {
                key: tab.href,
                label: (
                    <div
                        className={`flex items-center justify-between gap-3 py-1 px-1 min-w-[140px] ${
                            isActive ? 'font-semibold text-hub-primary' : 'text-hub-text'
                        }`}
                        onClick={() => router.push(tab.href)}
                    >
                        <span>{tab.label}</span>
                        {isActive && (
                            <Icon icon="lucide:check" className="text-hub-primary text-base" />
                        )}
                    </div>
                ),
            };
        });
        return items;
    }, [activeTab, router, tabs]);

    const mobileTitle = useMemo(() => {
        if (activeTab && pageTitle && pageTitle !== activeTab.label) {
            return `${pageTitle} · ${activeTab.label}`;
        }
        return activeTab?.label ?? pageTitle ?? '';
    }, [activeTab, pageTitle]);

    const renderPageHeading = () => {
        if (!pageTitle) {
            return null;
        }

        if (tabs && tabs.length > 1) {
            return (
                <div className="min-w-0 flex-1 md:max-w-[min(100%,28rem)] lg:max-w-[min(100%,36rem)]">
                    <CustomDropdown
                        menu={{ items: sectionDropdownItems }}
                        placement="bottomLeft"
                        trigger={['click']}
                    >
                        <button
                            type="button"
                            className="group flex items-center gap-1 rounded-lg text-left transition-colors hover:bg-hub-section-muted max-md:py-1 max-md:px-1.5 md:pointer-events-none md:p-0"
                        >
                            <h1
                                className="!m-0 max-w-[190px] truncate text-base font-semibold text-hub-title sm:max-w-[260px] sm:text-lg md:max-w-none md:text-xl"
                                title={mobileTitle}
                            >
                                <span className="md:hidden">{mobileTitle}</span>
                                <span className="hidden md:inline">{pageTitle}</span>
                            </h1>
                            <Icon
                                icon="lucide:chevron-down"
                                className="text-base text-hub-muted transition-transform group-hover:text-hub-text shrink-0 md:hidden"
                            />
                        </button>
                    </CustomDropdown>
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
