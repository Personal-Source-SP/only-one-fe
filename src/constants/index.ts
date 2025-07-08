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

export const PATH_NOT_AUTH = ['/login', '/register', '/forgot-password', '/connection'];

export const IMAGE_WIDTH_DEFAULT = 1500;
export const IMAGE_HEIGHT_DEFAULT = 1200;
export const ITEMS_PER_PAGE_DEFAULT = 50;
export const SLIDESHOW_DELAY_DEFAULT = 1000;
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif'];
