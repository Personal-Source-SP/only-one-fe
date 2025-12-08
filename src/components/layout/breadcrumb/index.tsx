'use client';

import CustomElement from '@/components/custom/custom-element';

import { SIDEBAR_ITEMS } from '@/constants';
import { ElementType } from '@/enums';
import { SidebarItem } from '@/interfaces';
import { Icon } from '@iconify/react';
import { Breadcrumb as AntBreadcrumb } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { getPageTitle } from '../index';

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

const Breadcrumb = () => {
    const router = useRouter();
    const pathname = usePathname();

    const breadcrumbItems = useMemo(() => {
        const foundPath = findBreadcrumbPath(SIDEBAR_ITEMS, pathname);

        const items = [
            {
                title: (
                    <span className="text-primary font-medium text-base flex items-center gap-2">
                        <Icon icon="mdi:home" className="text-lg" />
                        Trang chủ
                    </span>
                ),
            },
        ];

        if (!foundPath?.length) {
            return items;
        }

        foundPath.forEach((item, index) => {
            const isLast = index === foundPath.length - 1;

            items.push({
                title: isLast ? (
                    <span className="text-primary font-medium text-base flex items-center gap-2">
                        <Icon icon={item.icon} className="text-lg" />
                        {item.label}
                    </span>
                ) : (
                    <span
                        onClick={() => router.push(item.href || '')}
                        className="cursor-pointer hover:text-primary text-base flex items-center gap-2"
                    >
                        <Icon icon={item.icon} className="text-lg" />
                        {item.label}
                    </span>
                ),
            });
        });

        return items;
    }, [pathname, router]);

    return (
        <CustomElement
            elementType={ElementType.TITLE}
            title={getPageTitle(pathname, SIDEBAR_ITEMS)}
            actions={[
                <AntBreadcrumb
                    items={breadcrumbItems}
                    separator={<span className="text-gray-400">/</span>}
                />,
            ]}
        />
    );
};

export default Breadcrumb;
