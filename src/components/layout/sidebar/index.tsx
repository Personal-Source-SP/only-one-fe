import { Icon } from '@iconify/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC, memo, useEffect, useState } from 'react';

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

const Sidebar: FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Mock user role - in a real app, this would come from authentication
    const isAdmin = true;

    useEffect(() => {
        // Close mobile sidebar when location changes
        setMobileOpen(false);
    }, []);

    // Handle resize events to toggle between mobile and desktop view
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setMobileOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        setCollapsed(!collapsed);
    };

    const toggleMobileSidebar = () => {
        setMobileOpen(!mobileOpen);
    };

    const renderNavigation = (item: SidebarItem) => {
        if (item.checkAdmin && !isAdmin) return <></>;

        const pathname = usePathname();
        const isActive = pathname === item.href;

        return (
            <li>
                <Link
                    key={item.href}
                    href={item.href}
                    className={`sidebar-item ${isActive ? 'active' : ''}`}
                >
                    <Icon icon={item.icon} className="icon" />
                    {!collapsed && <span>{item.label}</span>}
                </Link>
            </li>
        );
    };

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
                    {!collapsed && (
                        <div className="flex items-center gap-2">
                            <Icon icon="cil:arrow-circle-top" className="text-2xl" />
                            <span className="font-medium text-lg">Hub</span>
                            <Icon icon="cil:arrow-circle-bottom" className="text-2xl" />
                        </div>
                    )}
                    {collapsed && <Icon icon="logos:google" className="text-2xl mx-auto" />}

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
                        href="/login"
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
