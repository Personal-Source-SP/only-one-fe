'use client';

import { CustomBreadcrumb } from '@/components/custom';
import { SIDEBAR_ITEMS } from '@/constants';
import { SidebarItem } from '@/interfaces';
import { Icon } from '@iconify/react';

import { usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';

const findBreadcrumbPath = (
    items: SidebarItem[],
    targetPath: string,
    path: Array<SidebarItem> = [],
): Array<SidebarItem> | null => {
    for (const item of items) {
        const currentPath = [...path];

        if (item.href) {
            currentPath.push(item);

            if (item.href === targetPath) {
                return currentPath;
            }
        }

        if (item.children) {
            const found = findBreadcrumbPath(item.children, targetPath, currentPath);
            if (found) {
                return found;
            }
        }
    }

    return null;
};

export const Breadcrumb = () => {
    const router = useRouter();
    const pathname = usePathname();

    const breadcrumbItems = useMemo(() => {
        const items = [
            {
                title: (
                    <span className="font-medium text-base flex items-center gap-2">
                        <Icon icon="mdi:home" className="text-lg" />
                        Trang chủ
                    </span>
                ),
            },
        ];

        const foundPath = findBreadcrumbPath(SIDEBAR_ITEMS, pathname);
        if (!foundPath?.length) return items;

        const pathItems = foundPath.map((item) => {
            const hasHref = item.href && item.href !== pathname;
            return {
                title: (
                    <span
                        key={item.href}
                        className={`${hasHref ? 'cursor-pointer hover:text-primary' : 'cursor-default text-primary'} text-base flex items-center gap-2`}
                        onClick={() => {
                            if (hasHref) {
                                router.push(item.href!);
                            }
                        }}
                    >
                        <Icon icon={item.icon} className="text-lg" />
                        {item.label}
                    </span>
                ),
            };
        });

        return [...items, ...pathItems];
    }, [pathname, router]);

    return (
        <CustomBreadcrumb
            items={breadcrumbItems}
            className="hidden md:block"
            separator={<span className="text-gray-400">/</span>}
        />
    );
};
