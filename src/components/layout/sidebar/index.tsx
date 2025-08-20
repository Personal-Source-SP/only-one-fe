import { Logo } from '@/components/common';
import { Icon } from '@iconify/react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC, memo, useCallback, useEffect, useState } from 'react';

interface SidebarItem {
    href: string;
    label: string;
    icon: string;
    checkAdmin?: boolean;
}

const sidebarItems: SidebarItem[] = [
    {
        href: '/dashboard',
        label: 'Dashboard',
        icon: 'lucide:layout-dashboard',
    },
    {
        href: '/drive',
        label: 'Google Drive',
        icon: 'logos:google-drive',
    },
    {
        href: '/photos',
        label: 'Google Photos',
        icon: 'logos:google-photos',
    },
    {
        href: '/keep',
        label: 'Google Keep',
        icon: 'logos:google-keep',
    },
    {
        href: '/users',
        label: 'Users',
        icon: 'lucide:users',
        checkAdmin: true,
    },
];

type SidebarProps = {
    mobileOpen: boolean;
    setMobileOpen: (open: boolean) => void;
};

const Sidebar: FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
    const isAdmin = true;
    const pathname = usePathname();

    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setMobileOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    const toggleSidebar = useCallback(() => {
        setCollapsed(!collapsed);
    }, [collapsed]);

    const handleLogout = useCallback(() => {
        signOut({
            callbackUrl: '/login',
        });
    }, []);

    const renderNavigation = useCallback(
        (item: SidebarItem) => {
            if (item.checkAdmin && !isAdmin) return <></>;
            const isActive = pathname === item.href;

            return (
                <li key={item.href}>
                    <Link href={item.href} className={`sidebar-item ${isActive ? 'active' : ''}`}>
                        <Icon icon={item.icon} className="icon" />
                        {!collapsed && <span>{item.label}</span>}
                    </Link>
                </li>
            );
        },
        [collapsed, isAdmin, pathname],
    );

    return (
        <>
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    onClick={() => setMobileOpen(false)}
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                />
            )}

            <aside
                className={`bg-content1 border-r border-divider transition-all duration-300 flex flex-col
          ${collapsed ? 'w-16' : 'w-64'} 
          md:relative md:translate-x-0 fixed inset-y-0 left-0 z-50
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Logo */}
                <div className="p-4 flex items-center justify-between border-b border-divider">
                    {!collapsed ? (
                        <div className="flex items-center gap-2 h-[32px]">
                            <Logo iconSize="2xl" textSize="lg" />
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 h-[32px]">
                            <Logo iconSize="sm" />
                        </div>
                    )}

                    <button
                        onClick={toggleSidebar}
                        className="text-foreground-500 hover:text-foreground-700 p-1 rounded-full hover:bg-content2 hidden md:block"
                    >
                        <Icon
                            className="text-lg"
                            icon={collapsed ? 'lucide:chevron-right' : 'lucide:chevron-left'}
                        />
                    </button>

                    <button
                        onClick={() => setMobileOpen(false)}
                        className="text-foreground-500 hover:text-foreground-700 p-1 rounded-full hover:bg-content2 md:hidden"
                    >
                        <Icon icon="lucide:x" className="text-lg" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 overflow-y-auto">
                    <ul className="space-y-1 px-2">{sidebarItems.map(renderNavigation)}</ul>
                </nav>

                {/* Logout */}
                <div className="p-2 mt-auto border-t border-divider">
                    <Link
                        href="#"
                        onClick={handleLogout}
                        className="sidebar-item text-foreground-600 hover:text-danger"
                    >
                        <Icon icon="lucide:log-out" className="icon" />
                        {!collapsed && <span>Đăng xuất</span>}
                    </Link>
                </div>
            </aside>
        </>
    );
};

export default memo(Sidebar);
