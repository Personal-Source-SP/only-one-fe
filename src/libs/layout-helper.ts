import type { BreadcrumbItem } from '@/components/common';
import { SIDEBAR_ITEMS } from '@/constants';
import type { SectionTab, SidebarItem } from '@/interfaces';

const pathnameMatchesHref = (pathname: string, href: string): boolean =>
    pathname === href || pathname.startsWith(`${href}/`);

export const getSectionTabs = (pathname: string): SectionTab[] | null => {
    for (const item of SIDEBAR_ITEMS) {
        if (!item.children?.length || item.children.length < 2) {
            continue;
        }

        const matchesSection = item.children.some(
            (child) => child.href && pathnameMatchesHref(pathname, child.href),
        );

        if (!matchesSection) {
            continue;
        }

        return item.children
            .filter((child): child is SidebarItem & { href: string } => Boolean(child.href))
            .map((child) => ({
                href: child.href,
                icon: child.icon,
                label: child.label,
            }));
    }

    return null;
};

export const getSectionBreadcrumbs = (pathname: string): BreadcrumbItem[] | null => {
    for (const item of SIDEBAR_ITEMS) {
        if (!item.children?.length) continue;

        const matchedChild = item.children.find(
            (child) => child.href && pathnameMatchesHref(pathname, child.href),
        );

        if (!matchedChild || !matchedChild.href) continue;

        const breadcrumbs: BreadcrumbItem[] = [
            {
                key: item.label,
                label: item.label,
                iconName: item.icon,
            },
            {
                key: matchedChild.href,
                label: matchedChild.label,
                href: matchedChild.href,
                iconName: matchedChild.icon,
            },
        ];

        if (pathname !== matchedChild.href && pathname.startsWith(`${matchedChild.href}/`)) {
            const subSegments = pathname
                .slice(matchedChild.href.length + 1)
                .split('/')
                .filter(Boolean);

            subSegments.forEach((segment, idx) => {
                breadcrumbs.push({
                    key: `sub-${idx}-${segment}`,
                    label: decodeURIComponent(segment),
                });
            });
        }

        return breadcrumbs;
    }

    return null;
};

export const findInformationPage = (pathname: string, items: SidebarItem[]): SidebarItem | null => {
    for (const item of items) {
        if (item.href === pathname) {
            return item;
        }

        if (item.children) {
            const found = findInformationPage(pathname, item.children);
            if (found) {
                return found;
            }
        }
    }

    return null;
};

export const getPageTitle = (pathname: string, items?: SidebarItem[]): string => {
    const found = findInformationPage(pathname, items || SIDEBAR_ITEMS);
    return found?.label || 'O-O Hub';
};
