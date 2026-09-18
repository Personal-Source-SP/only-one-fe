import type { IFieldMetadata } from '@/interfaces';

export const DATA_PROVIDER_FIELDS = {
    NAME: {
        key: 'name',
        label: 'Tên nhà cung cấp',
        tableTitle: 'Tên',
        placeholder: 'Nhập tên nhà cung cấp',
        maxLength: 255,
        width: '25%',
        requiredMessage: 'Vui lòng nhập tên nhà cung cấp',
    },
    IDENTIFIER: {
        key: 'identifier',
        label: 'Mã nhà cung cấp',
        tableTitle: 'Mã',
        placeholder: 'Nhập mã nhà cung cấp',
        maxLength: 20,
        width: '15%',
        requiredMessage: 'Vui lòng nhập mã nhà cung cấp',
        messages: {
            code: 'Mã nhà cung cấp chỉ được chứa chữ cái thường, số và dấu gạch ngang',
        },
    },
    BASE_URL: {
        key: 'baseUrl',
        label: 'URL cơ sở',
        tableTitle: 'URL cơ sở',
        placeholder: 'https://example.com',
        width: '30%',
        requiredMessage: 'Vui lòng nhập URL cơ sở',
    },
    CREATED_AT: {
        key: 'createdAt',
        label: 'Ngày tạo',
        tableTitle: 'Ngày tạo',
        width: '15%',
    },
} as const satisfies Record<string, IFieldMetadata>;
