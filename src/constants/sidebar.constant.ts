import { SidebarItem } from '../interfaces';

export const SIDEBAR_ITEMS: SidebarItem[] = [
    {
        href: '/dashboard',
        label: 'Tổng quan',
        icon: 'emojione:bar-chart',
    },
    {
        label: 'Google Drive',
        icon: 'flat-color-icons:google',
        children: [
            {
                href: '/google/drive/folders',
                label: 'Thư mục',
                icon: 'emojione:open-file-folder',
            },
            {
                href: '/google/drive/photos',
                label: 'Ảnh',
                icon: 'noto:framed-picture',
            },
            {
                href: '/google/keep',
                label: 'Lưu trữ',
                icon: 'noto-v1:package',
            },
        ],
    },
    {
        label: 'Dữ liệu',
        icon: 'noto:package',
        children: [
            {
                href: '/scraping/data-providers',
                label: 'Nhà cung cấp',
                icon: 'noto:factory',
            },
            {
                href: '/scraping/provider-items',
                label: 'Đối tượng nhà cung cấp',
                icon: 'noto:package',
            },
            {
                href: '/scraping/items',
                label: 'Đối tượng',
                icon: 'noto:page-facing-up',
            },
            {
                href: '/scraping/scraping-data',
                label: 'Dữ liệu cào',
                icon: 'noto:file-folder',
            },
        ],
    },
    {
        label: 'Lịch biểu',
        icon: 'noto:alarm-clock',
        children: [
            {
                href: '/schedule/executions',
                label: 'Lịch biểu thực thi',
                icon: 'noto:stopwatch',
            },
            {
                href: '/schedule/job-events',
                label: 'Sự kiện lịch biểu',
                icon: 'noto:spiral-calendar',
            },
        ],
    },
    {
        label: 'Mô phỏng',
        icon: 'noto:globe-with-meridians',
        children: [
            {
                href: '/simulation/contexts',
                label: 'Danh sách ngữ cảnh',
                icon: 'mdi:format-list-bulleted',
            },
            {
                href: '/simulation/items',
                label: 'Danh sách mô phỏng',
                icon: 'noto:page-facing-up',
            },
        ],
    },
    {
        label: 'Cloud Data',
        icon: 'mdi:cloud-outline',
        children: [
            {
                href: '/cloud-data/providers',
                label: 'Nhà cung cấp',
                icon: 'emojione:package',
            },
            {
                href: '/cloud-data/items',
                label: 'Dữ liệu',
                icon: 'emojione:open-file-folder',
            },
        ],
    },
    {
        label: 'Quản lý',
        icon: 'flat-color-icons:settings',
        children: [
            {
                href: '/setting/users',
                label: 'Người dùng',
                icon: 'noto:people-holding-hands',
            },
        ],
    },
];
