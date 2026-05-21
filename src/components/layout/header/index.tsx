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

type HeaderProps = {
    pageDescription?: string;
    pageTitle?: string;
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
    pageDescription,
    pageTitle,
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
        return (
            <CustomFlex align="center" className="min-w-0 flex-1 gap-2 md:gap-3">
                <CustomButton
                    touchFriendly
                    type="text"
                    shape="circle"
                    className="shrink-0 min-h-11 min-w-11 md:hidden"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    icon={<Icon icon="lucide:menu" className="text-xl" />}
                />
                {renderPageHeading()}
            </CustomFlex>
        );
    };

    const renderNavbarRight = () => {
        return (
            <CustomFlex align="center" gap={8} className="shrink-0 md:gap-4">
                <CustomButton
                    touchFriendly
                    type="text"
                    shape="circle"
                    className="min-h-11 min-w-11 md:hidden"
                    onClick={() => setShowSearch(!showSearch)}
                    icon={<Icon icon="lucide:search" className="text-xl text-hub-muted" />}
                />

                <div className="relative hidden md:block">
                    <CustomInput
                        type="text"
                        placeholder="Tìm kiếm..."
                        className="rounded-full bg-hub-bg py-2 pl-10 pr-4 w-48 text-sm focus:outline-none focus:ring-2 focus:ring-hub-primary/20 lg:w-64"
                    />
                </div>

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
            className={`fixed top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-hub-border bg-hub-surface px-4 md:h-16 ${
                sidebarCollapsed ? 'md:left-16 md:right-0' : 'md:left-64 md:right-0'
            } left-0 right-0`}
        >
            {renderNavbarLeft()}
            {renderNavbarRight()}
        </section>
    );
};
