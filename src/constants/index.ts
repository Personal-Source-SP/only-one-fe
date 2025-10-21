import { SidebarItem } from '@/interfaces';

export const SLIDESHOW_DELAY_OPTIONS = [
    { value: 1000, label: '1 giây' },
    { value: 2000, label: '2 giây' },
    { value: 3000, label: '3 giây' },
    { value: 5000, label: '5 giây' },
    { value: 10000, label: '10 giây' },
];

export const SORT_FIELD_OPTIONS = [
    { value: 'name', label: 'Tên' },
    { value: 'date', label: 'Ngày tạo' },
];

export const SORT_ORDER_OPTIONS = [
    { value: 'asc', label: 'Tăng dần' },
    { value: 'desc', label: 'Giảm dần' },
];

export const ITEMS_PER_PAGE_OPTIONS = [
    { value: 0, label: 'Tất cả' },
    { value: 20, label: '20 ảnh' },
    { value: 50, label: '50 ảnh' },
    { value: 100, label: '100 ảnh' },
];

export const KEY_LOCAL_STORAGE = {
    FIREBASE_TOKEN: 'firebase_token',
    GOOGLE_ACCESS_TOKEN: 'google_access_token',
    GOOGLE_TOKEN_EXPIRY: 'google_token_expiry',
    GOOGLE_REFRESH_TOKEN: 'google_refresh_token',
    GOOGLE_CODE_VERIFIER: 'google_code_verifier',
};

export const GOOGLE_SCOPES = [
    'email', // Lấy địa chỉ email của người dùng
    'profile', // Lấy thông tin profile cơ bản của người dùng (tên, avatar, ...)
    'https://www.googleapis.com/auth/drive.metadata.readonly', // Đọc metadata file & thư mục
    'https://www.googleapis.com/auth/drive.readonly', // Truy cập chỉ-đọc vào tất cả file, thư mục
];

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
                href: '/folder',
                label: 'Thư mục',
                icon: 'emojione:open-file-folder',
            },
            {
                href: '/photos',
                label: 'Ảnh',
                icon: 'noto:framed-picture',
            },
            {
                href: '/keep',
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
                href: '/items',
                label: 'Đối tượng',
                icon: 'noto:page-facing-up',
            },
            {
                href: '/data-provider',
                label: 'Nhà cung cấp',
                icon: 'noto:factory',
            },
            {
                href: '/data-provider-item',
                label: 'Đối tượng nhà cung cấp',
                icon: 'noto:package',
            },
            {
                href: '/item-data',
                label: 'Dữ liệu đối tượng',
                icon: 'noto:file-folder',
            },
        ],
    },
    {
        href: '/users',
        label: 'Người dùng',
        icon: 'noto:people-holding-hands',
        checkAdmin: true,
    },
];

export const AUTH_PUBLIC_PAGES = ['/login', '/register', '/forget-password'];

export const IMAGE_WIDTH_DEFAULT = 1500;
export const IMAGE_HEIGHT_DEFAULT = 1200;
export const ITEMS_PER_PAGE_DEFAULT = 50;
export const SLIDESHOW_DELAY_DEFAULT = 1000;
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif'];

export const SERVER_IS_NOT_READY_MESSAGE = 'Server is not ready';
