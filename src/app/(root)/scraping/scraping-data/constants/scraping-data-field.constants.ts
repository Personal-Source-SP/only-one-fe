import type { IFieldMetadata } from '@/interfaces';

export const SCRAPING_DATA_FIELDS = {
    ITEM: {
        key: 'item',
        label: 'Đối tượng',
        table: {
            title: 'Đối tượng',
            width: '25%',
            ellipsis: true,
        },
    },
    DATA_ID: {
        key: 'dataId',
        label: 'ID dữ liệu',
        table: {
            title: 'ID dữ liệu',
            width: '20%',
            sorter: true,
            ellipsis: true,
        },
    },
    TYPE: {
        key: 'type',
        label: 'Loại',
        table: {
            title: 'Loại',
            width: '20%',
            sorter: true,
        },
    },
    LAST_MODIFIED: {
        key: 'lastModified',
        label: 'Ngày sửa đổi',
        table: {
            title: 'Ngày sửa đổi',
            width: '20%',
            sorter: true,
        },
    },
    URL: {
        key: 'url',
        label: 'URL',
        table: {
            title: 'URL',
            width: '15%',
            sorter: true,
            align: 'center',
        },
    },
} as const satisfies Record<string, IFieldMetadata>;
