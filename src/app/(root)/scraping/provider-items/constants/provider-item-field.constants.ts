import type { IFieldMetadata } from '@/interfaces';
import { FormRuleType } from '@/utilities';

export const PROVIDER_ITEM_FIELDS = {
    ITEM_ID: {
        key: 'itemId',
        label: 'Tên đối tượng',
        table: {
            title: 'Đối tượng',
            width: '20%',
            ellipsis: true,
        },
        form: {
            type: 'select',
            placeholder: 'Chọn đối tượng',
            rulesConfig: [
                {
                    type: FormRuleType.Required,
                    message: 'Vui lòng chọn đối tượng',
                },
            ],
        },
    },
    DATA_PROVIDER_ID: {
        key: 'dataProviderId',
        label: 'Nhà cung cấp',
        table: {
            title: 'Nhà cung cấp',
            width: '20%',
            ellipsis: true,
        },
        form: {
            type: 'select',
            placeholder: 'Chọn nhà cung cấp',
            rulesConfig: [
                {
                    type: FormRuleType.Required,
                    message: 'Vui lòng chọn nhà cung cấp',
                },
            ],
        },
    },
    ITEM_URL: {
        key: 'itemUrl',
        label: 'URL đối tượng',
        table: {
            title: 'URL đối tượng',
            width: '25%',
            ellipsis: true,
        },
        form: {
            type: 'input',
            placeholder: 'Nhập URL đối tượng',
            rulesConfig: [
                {
                    type: FormRuleType.Required,
                    message: 'Vui lòng nhập URL đối tượng',
                },
                {
                    type: FormRuleType.Url,
                    message: 'URL không hợp lệ',
                },
            ],
        },
    },
    CLOUD_DATA_PROVIDER_ID: {
        key: 'cloudDataProviderId',
        label: 'Nhà cung cấp kho dữ liệu',
        form: {
            type: 'select',
            placeholder: 'Chọn nhà cung cấp kho dữ liệu (nếu có)',
        },
    },
    LAST_SCRAPED_TIMESTAMP: {
        key: 'lastScrapedTimestamp',
        label: 'Ngày cào gần nhất',
        table: {
            title: 'Ngày cào gần nhất',
            width: 150,
            sorter: true,
        },
    },
    IS_ACTIVE: {
        key: 'isActive',
        label: 'Trạng thái hoạt động',
        table: {
            title: 'Trạng thái',
            width: 140,
            align: 'center',
        },
    },
    IS_SAVED_TO_CLOUD_DATA: {
        key: 'isSavedToCloudData',
        label: 'Lưu vào kho dữ liệu',
        table: {
            title: 'Lưu Cloud',
            width: 120,
            align: 'center',
        },
    },
    CREATED_AT: {
        key: 'createdAt',
        label: 'Ngày tạo',
        table: {
            title: 'Ngày tạo',
            width: 150,
            sorter: true,
        },
    },
} as const satisfies Record<string, IFieldMetadata>;
