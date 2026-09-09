import { DisplayMode, ViewFileMode } from '@/enums';
import { FilterItem } from '@/interfaces';

type FilterOptions = NonNullable<FilterItem['options']>;

export const dataTypeOptions: FilterOptions = [
    { label: 'Ảnh', value: 'image' },
    { label: 'Video', value: 'video' },
    { label: 'Tài liệu', value: 'document' },
];

export const viewModeOptions: FilterOptions = [
    { value: ViewFileMode.ALL, label: 'Xem tất cả' },
    { value: ViewFileMode.DATE, label: 'Xem theo ngày' },
    { value: ViewFileMode.FOLDER, label: 'Xem theo thư mục' },
];

export const columnDisplayOptions: FilterOptions = [1, 2, 3, 4, 8].map((item) => ({
    value: item,
    label: item.toString(),
}));

export const getFilterSearch = (displayMode: DisplayMode) => ({
    placeholder: 'Tìm kiếm lịch sử dữ liệu',
    span: displayMode === DisplayMode.TABLE ? 8 : 6,
});
