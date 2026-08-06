import React from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { ColumnsType, CustomFlex } from '@/components/custom';
import { DisplayMode, ViewFileMode } from '@/enums';
import { FilterItem, NDataProvider } from '@/interfaces';
import { formatDate } from '@/libs';

export const columns: ColumnsType<NDataProvider.IScrapingData> = [
    {
        title: 'Đối tượng',
        dataIndex: 'item',
        key: 'item',
        ellipsis: true,
        width: '25%',
        render: (item: NDataProvider.IItem) => item?.name ?? '---',
    },
    {
        title: 'ID dữ liệu',
        dataIndex: 'dataId',
        key: 'dataId',
        ellipsis: true,
        sorter: true,
        width: '20%',
        render: (dataId: string) => dataId ?? '---',
    },
    {
        title: 'Loại',
        dataIndex: 'type',
        key: 'type',
        sorter: true,
        width: '20%',
        render: (type: string) => type ?? '---',
    },
    {
        title: 'Ngày sửa đổi',
        dataIndex: 'lastModified',
        key: 'lastModified',
        sorter: true,
        width: '20%',
        render: (lastModified: Date) => formatDate(lastModified),
    },
    {
        title: 'URL',
        dataIndex: 'url',
        key: 'url',
        sorter: true,
        width: '15%',
        align: 'center',
        render: (url: string) =>
            url ? (
                <CustomFlex align="center" justify="center">
                    <Link href={url} target="_blank" rel="noopener noreferrer">
                        <img src={url} alt="Xem" className="!h-20" />
                    </Link>
                </CustomFlex>
            ) : (
                '---'
            ),
    },
];

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

export const displayModeOptions = [
    {
        value: DisplayMode.LIST,
        label: (
            <span className="flex items-center gap-2">
                <Icon icon="lucide:list" className="shrink-0 text-base" />
                Danh sách
            </span>
        ),
    },
    {
        value: DisplayMode.TABLE,
        label: (
            <span className="flex items-center gap-2">
                <Icon icon="lucide:table" className="shrink-0 text-base" />
                Bảng
            </span>
        ),
    },
];

export const getFilterSearch = (displayMode: DisplayMode) => ({
    placeholder: 'Tìm kiếm lịch sử dữ liệu',
    span: displayMode === DisplayMode.TABLE ? 8 : 6,
});
