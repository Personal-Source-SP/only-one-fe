import { SIDEBAR_ITEMS } from '@/constants';
import { SidebarItem } from '@/interfaces';

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
