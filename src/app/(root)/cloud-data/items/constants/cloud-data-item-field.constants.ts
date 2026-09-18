import type { IFieldMetadata } from '@/interfaces';
import { FormRuleType } from '@/utilities';

export const CLOUD_DATA_ITEM_FIELDS = {
    CLOUD_DATA_PROVIDER_ID: {
        key: 'cloudDataProviderId',
        label: 'Nhà cung cấp kho dữ liệu',
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
    FILE_NAME: {
        key: 'fileName',
        label: 'Tên file',
        table: {
            title: 'Tên file',
            width: 200,
            ellipsis: true,
        },
    },
    PATH_URL: {
        key: 'pathUrl',
        label: 'Đường dẫn',
        table: {
            title: 'Đường dẫn',
            width: 250,
            ellipsis: true,
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
    },
    MIME_TYPE: {
        key: 'mimeType',
        label: 'Loại file',
        table: {
            title: 'Loại file',
            width: 150,
            ellipsis: true,
        },
    },
    FILE_SIZE: {
        key: 'fileSize',
        label: 'Dung lượng',
        table: {
            title: 'Dung lượng',
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
