export interface ISidebarItem {
    label: string;
    icon: string;
    href?: string;
    sectionHref?: string;
    checkAdmin?: boolean;
    description?: string;
    children?: ISidebarItem[];
}

export interface ISectionTab {
    href: string;
    icon?: string;
    label: string;
}
