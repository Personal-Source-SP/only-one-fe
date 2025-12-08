import { SidebarItem } from '../interfaces';

export const SIDEBAR_ITEMS: SidebarItem[] = [
    {
        label: 'Tổng quan',
        icon: 'emojione:bar-chart',
        href: '/dashboard',
    },
    {
        label: 'Google Drive',
        icon: 'flat-color-icons:google',
        children: [
            {
                label: 'Thư mục',
                href: '/google/drive/folders',
                icon: 'emojione:open-file-folder',
            },
            {
                label: 'Ảnh',
                href: '/google/drive/photos',
                icon: 'noto:framed-picture',
            },
            {
                label: 'Lưu trữ',
                href: '/google/keep',
                icon: 'noto-v1:package',
            },
        ],
    },
    {
        label: 'Cào dữ liệu',
        icon: 'noto:package',
        children: [
            {
                label: 'Nhà cung cấp',
                icon: 'noto:factory',
                href: '/scraping/data-providers',
            },
            {
                label: 'Đối tượng nhà cung cấp',
                icon: 'noto:package',
                href: '/scraping/provider-items',
            },
            {
                label: 'Đối tượng',
                icon: 'noto:page-facing-up',
                href: '/scraping/items',
            },
            {
                label: 'Dữ liệu cào',
                icon: 'noto:file-folder',
                href: '/scraping/scraping-data',
            },
        ],
    },
    {
        label: 'Lịch biểu',
        icon: 'noto:alarm-clock',
        children: [
            {
                label: 'Lịch biểu thực thi',
                icon: 'noto:stopwatch',
                href: '/schedule/executions',
            },
            {
                label: 'Sự kiện lịch biểu',
                icon: 'noto:spiral-calendar',
                href: '/schedule/job-events',
            },
        ],
    },
    {
        label: 'Mô phỏng',
        icon: 'noto:globe-with-meridians',
        children: [
            {
                label: 'Ngữ cảnh mô phỏng',
                icon: 'mdi:format-list-bulleted',
                href: '/simulation/contexts',
            },
            {
                label: 'Đối tượng mô phỏng',
                icon: 'noto:page-facing-up',
                href: '/simulation/items',
            },
        ],
    },
    {
        label: 'Cloud Data',
        icon: 'mdi:cloud-outline',
        children: [
            {
                label: 'Nhà cung cấp cloud',
                icon: 'emojione:package',
                href: '/cloud-data/providers',
            },
            {
                label: 'Dữ liệu cloud',
                icon: 'emojione:open-file-folder',
                href: '/cloud-data/items',
            },
        ],
    },
    {
        label: 'Quản lý',
        icon: 'flat-color-icons:settings',
        children: [
            {
                label: 'Người dùng',
                icon: 'noto:people-holding-hands',
                href: '/setting/users',
            },
        ],
    },
];
