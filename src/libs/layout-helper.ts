import type { BreadcrumbItem } from '@/components/common';
import { SIDEBAR_ITEMS } from '@/constants';
import type { ISectionTab, ISidebarItem } from '@/interfaces';

const pathnameMatchesHref = (pathname: string, href: string): boolean =>
    pathname === href || pathname.startsWith(`${href}/`);

export const getSectionTabs = (pathname: string): ISectionTab[] | null => {
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
            .filter((child): child is ISidebarItem & { href: string } => Boolean(child.href))
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
                const decoded = decodeURIComponent(segment);
                const isUuid =
                    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(decoded);

                breadcrumbs.push({
                    key: `sub-${idx}-${segment}`,
                    label: isUuid ? 'Chi tiết' : decoded,
                });
            });
        }

        return breadcrumbs;
    }

    return null;
};

export const findInformationPage = (
    pathname: string,
    items: ISidebarItem[],
): ISidebarItem | null => {
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

export const getPageTitle = (pathname: string, items?: ISidebarItem[]): string => {
    const found = findInformationPage(pathname, items || SIDEBAR_ITEMS);
    return found?.label || 'O-O Hub';
};
