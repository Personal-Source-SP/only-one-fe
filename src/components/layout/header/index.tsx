import { KEY_SESSION_STORAGE } from '@/constants';
import { Theme } from '@/enums';
import { useMainContext } from '@contexts/MainContext';
import { Icon } from '@iconify/react';
import { Avatar, Badge, Button, Dropdown, Input, MenuProps } from 'antd';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

type HeaderProps = {
    showSearch: boolean;
    mobileMenuOpen: boolean;
    showNotifications: boolean;
    sidebarCollapsed?: boolean;
    setShowSearch: (show: boolean) => void;
    getPageTitle: (pathname: string) => string;
    setMobileMenuOpen: (open: boolean) => void;
    setShowNotifications: (show: boolean) => void;
};

interface SettingItem {
    label: string;
    icon: string;
    disabled?: boolean;
    onClick: () => void;
}

const Header = ({
    showSearch,
    mobileMenuOpen,
    showNotifications,
    sidebarCollapsed = false,
    setShowSearch,
    getPageTitle,
    setMobileMenuOpen,
    setShowNotifications,
}: HeaderProps) => {
    const pathname = usePathname();

    const { theme } = useMainContext();

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
                <h1 className="text-xl font-medium m-0">{getPageTitle(pathname)}</h1>
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
                    <Input
                        type="text"
                        placeholder="Tìm kiếm..."
                        className="bg-content2 rounded-full py-2 pl-10 pr-4 w-64 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
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

    const getThemeClasses = () => {
        switch (theme) {
            case Theme.DARK:
                return 'bg-slate-900 border-slate-800 text-white';
            case Theme.BRAND:
                return 'bg-indigo-600 border-transparent text-white';
            default:
                return 'bg-white border-slate-200 text-slate-800';
        }
    };

    // return (
    //     <header
    //         className={`h-16 border-b sticky top-0 z-20 px-4 sm:px-8 flex items-center justify-between shadow-sm transition-all duration-200 ${getThemeClasses()}`}
    //     >
    //         <div className="flex items-center gap-3 sm:gap-4">
    //             <button
    //                 onClick={onMobileMenuToggle}
    //                 className={`p-2 -ml-2 rounded-lg md:hidden transition-colors ${theme === 'light' ? 'text-slate-500 hover:bg-slate-50' : 'text-white/80 hover:bg-white/10'}`}
    //             >
    //                 <Icon icon="lucide:menu" className="w-6 h-6" />
    //             </button>

    //             <div className="flex md:hidden items-center gap-2">
    //                 <Icon
    //                     icon="lucide:arrow-up-circle"
    //                     className={`w-6 h-6 ${theme === Theme.BRAND ? 'text-white' : 'text-indigo-600'}`}
    //                 />
    //                 <span className="font-bold text-lg tracking-tight">Hub Center</span>
    //             </div>

    //             <nav className="hidden md:flex" aria-label="Breadcrumb">
    //                 <ol className="flex items-center space-x-2">
    //                     <li>
    //                         <a
    //                             href="#"
    //                             className={
    //                                 theme === Theme.LIGHT
    //                                     ? 'text-slate-400 hover:text-slate-500'
    //                                     : 'text-white/40 hover:text-white/60'
    //                             }
    //                         >
    //                             <Icon icon="lucide:home" className="h-4 w-4" />
    //                         </a>
    //                     </li>
    //                     <li>
    //                         <span
    //                             className={
    //                                 theme === Theme.LIGHT ? 'text-slate-300' : 'text-white/20'
    //                             }
    //                         >
    //                             /
    //                         </span>
    //                     </li>
    //                     <li>
    //                         <span
    //                             className={`text-sm font-medium ${theme === Theme.LIGHT ? 'text-slate-800' : 'text-white'}`}
    //                         >
    //                             Hệ thống
    //                         </span>
    //                     </li>
    //                 </ol>
    //             </nav>
    //         </div>

    //         <HeaderActions onOpenGallery={onOpenGallery} headerTheme={theme} />
    //     </header>
    // );

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

export default Header;
