'use client';

import { Logo } from '@/components/common';
import { Icon } from '@iconify/react';
import { Button, Drawer, Menu } from 'antd';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC, memo } from 'react';

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

    const menuItems = sidebarItems
        .filter((item) => !(item.checkAdmin && !isAdmin))
        .map((item) => ({
            key: item.href,
            icon: <Icon icon={item.icon} className="text-xl" />,
            label: (
                <Link
                    href={item.href}
                    className="flex items-center gap-3"
                    onClick={() => setMobileOpen(false)}
                >
                    {item.label}
                </Link>
            ),
        }));

    return (
        <Drawer
            width={300}
            zIndex={1050}
            closable={false}
            placement="left"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            className="md:hidden [&_.ant-drawer-body]:px-2"
            style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }}
        >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-divider">
                <div className="flex items-center gap-2 h-[32px] px-4">
                    <Logo iconSize="2xl" textSize="lg" />
                </div>
                <Button
                    type="text"
                    shape="circle"
                    aria-label="Close sidebar"
                    onClick={() => setMobileOpen(false)}
                    icon={<Icon icon="lucide:x" className="text-lg" />}
                    className="text-foreground-500 hover:text-foreground-700"
                />
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 overflow-y-auto [&_.ant-menu]:!border-none">
                <Menu mode="inline" items={menuItems} selectedKeys={[pathname]} />
            </nav>
        </Drawer>
    );
};

export default memo(Sidebar);
