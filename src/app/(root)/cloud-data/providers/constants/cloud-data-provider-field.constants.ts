import type { IFieldMetadata } from '@/interfaces';
import { FormRuleType } from '@/utilities';

export const CLOUD_DATA_PROVIDER_FIELDS = {
    NAME: {
        key: 'name',
        label: 'Tên kho',
        table: {
            title: 'Tên kho',
            width: 200,
            ellipsis: true,
        },
        form: {
            type: 'input',
            placeholder: 'Nhập tên nhà cung cấp',
            rulesConfig: [
                {
                    type: FormRuleType.Required,
                    message: 'Vui lòng nhập tên nhà cung cấp',
                },
            ],
        },
    },
    TYPE: {
        key: 'type',
        label: 'Loại',
        table: {
            title: 'Loại',
            width: 150,
        },
        form: {
            type: 'select',
            placeholder: 'Chọn loại',
            rulesConfig: [
                {
                    type: FormRuleType.Required,
                    message: 'Vui lòng chọn loại nhà cung cấp',
                },
            ],
        },
    },
    CONFIG: {
        key: 'config',
        label: 'Cấu hình (JSON)',
        form: {
            type: 'input',
            placeholder: '{"channelId": ""}',
        },
    },
    IS_ACTIVE: {
        key: 'isActive',
        label: 'Trạng thái',
        table: {
            title: 'Trạng thái',
            width: 150,
            align: 'center',
        },
        form: {
            type: 'switch',
        },
    },
    TOTAL_ITEMS: {
        key: 'totalItems',
        label: 'Tổng số dữ liệu',
        table: {
            title: 'Tổng số dữ liệu',
            width: 150,
            align: 'center',
        },
    },
    TOTAL_SIZE: {
        key: 'totalSize',
        label: 'Tổng dung lượng',
        table: {
            title: 'Tổng dung lượng',
            width: 150,
            align: 'center',
        },
    },
    CREATED_AT: {
        key: 'createdAt',
        label: 'Ngày tạo',
        table: {
            title: 'Ngày tạo',
            width: 200,
            sorter: true,
        },
    },
} as const satisfies Record<string, IFieldMetadata>;
