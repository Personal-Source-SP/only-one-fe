import { SidebarItem } from '@/interfaces';

export const SIDEBAR_ITEMS: SidebarItem[] = [
    {
        label: 'Tổng quan',
        icon: 'emojione:bar-chart',
        href: '/dashboard',
    },
    {
        label: 'Google Drive',
        icon: 'flat-color-icons:google',
        sectionHref: '/google/drive/folders',
        children: [
            {
                label: 'Thư mục',
                href: '/google/drive/folders',
                icon: 'emojione:open-file-folder',
                description: 'Quản lý các thư mục trong Google Drive',
            },
            {
                label: 'Ảnh',
                href: '/google/drive/photos',
                icon: 'noto:framed-picture',
                description: 'Xem và quản lý ảnh từ Google Drive',
            },
            {
                label: 'Lưu trữ',
                href: '/google/keep',
                icon: 'noto-v1:package',
                description: 'Quản lý ghi chú trong Google Keep',
            },
        ],
    },
    {
        label: 'Cào dữ liệu',
        icon: 'noto:package',
        sectionHref: '/scraping/data-providers',
        children: [
            {
                label: 'Nhà cung cấp',
                icon: 'noto:factory',
                href: '/scraping/data-providers',
                description: 'Quản lý các nhà cung cấp dữ liệu',
            },
            {
                label: 'Đối tượng nhà cung cấp',
                icon: 'noto:package',
                href: '/scraping/provider-items',
                description: 'Quản lý các đối tượng thuộc nhà cung cấp',
            },
            {
                label: 'Đối tượng',
                icon: 'noto:page-facing-up',
                href: '/scraping/items',
                description: 'Quản lý các đối tượng được cào',
            },
            {
                label: 'Dữ liệu cào',
                icon: 'noto:file-folder',
                href: '/scraping/scraping-data',
                description: 'Xem và quản lý dữ liệu đã được cào',
            },
        ],
    },
    {
        label: 'Lịch biểu',
        icon: 'noto:alarm-clock',
        sectionHref: '/schedule/executions',
        children: [
            {
                label: 'Lịch biểu thực thi',
                icon: 'noto:stopwatch',
                href: '/schedule/executions',
                description: 'Quản lý các lịch biểu thực thi công việc',
            },
            {
                label: 'Sự kiện lịch biểu',
                icon: 'noto:spiral-calendar',
                href: '/schedule/job-events',
                description: 'Xem và quản lý các sự kiện lịch biểu',
            },
        ],
    },
    {
        label: 'Mô phỏng',
        icon: 'noto:globe-with-meridians',
        sectionHref: '/simulation/contexts',
        children: [
            {
                label: 'Ngữ cảnh mô phỏng',
                icon: 'mdi:format-list-bulleted',
                href: '/simulation/contexts',
                description: 'Quản lý các ngữ cảnh mô phỏng',
            },
            {
                label: 'Đối tượng mô phỏng',
                icon: 'noto:page-facing-up',
                href: '/simulation/items',
                description: 'Quản lý các đối tượng mô phỏng',
            },
        ],
    },
    {
        label: 'Cloud Data',
        icon: 'mdi:cloud-outline',
        sectionHref: '/cloud-data/providers',
        children: [
            {
                label: 'Nhà cung cấp cloud',
                icon: 'emojione:package',
                href: '/cloud-data/providers',
                description: 'Quản lý các nhà cung cấp dịch vụ cloud',
            },
            {
                label: 'Dữ liệu cloud',
                icon: 'emojione:open-file-folder',
                href: '/cloud-data/items',
                description: 'Xem và quản lý dữ liệu trên cloud',
            },
        ],
    },
    {
        label: 'Quản lý',
        icon: 'flat-color-icons:settings',
        sectionHref: '/setting/users',
        children: [
            {
                label: 'Người dùng',
                icon: 'noto:people-holding-hands',
                href: '/setting/users',
                description: 'Quản lý người dùng hệ thống',
            },
        ],
    },
];
