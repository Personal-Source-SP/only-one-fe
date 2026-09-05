import { ViewFileMode } from '@/enums';
import { FilterItem } from '@/interfaces';
import { QualityMode } from '../enums';

type FilterOptions = NonNullable<FilterItem['options']>;

export const viewModeOptions: FilterOptions = [
    { value: ViewFileMode.ALL, label: 'Xem tất cả' },
    { value: ViewFileMode.DATE, label: 'Xem theo ngày' },
    { value: ViewFileMode.FOLDER, label: 'Xem theo thư mục' },
];

export const qualityModeOptions: FilterOptions = [
    { value: QualityMode.HIGH, label: 'Nét' },
    { value: QualityMode.LOW, label: 'Thường' },
];

export const columnOptions: FilterOptions = [1, 2, 3, 4, 8].map((item) => ({
    value: item,
    label: item.toString(),
}));

export const filterSearch = {
    span: 14,
    name: 'name',
    placeholder: 'Tìm kiếm ảnh',
};
