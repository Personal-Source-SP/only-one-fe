import type { IFieldMetadata } from '@/interfaces';
import { FormRuleType } from '@/utilities';

export const DATA_PROVIDER_FIELDS = {
    NAME: {
        key: 'name',
        label: 'Tên nhà cung cấp',
        table: {
            title: 'Tên',
            width: '25%',
            sorter: true,
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
                {
                    type: FormRuleType.Max,
                    max: 255,
                    message: 'Tên nhà cung cấp không được vượt quá 255 ký tự',
                },
            ],
        },
    },
    IDENTIFIER: {
        key: 'identifier',
        label: 'Mã nhà cung cấp',
        table: {
            title: 'Mã',
            width: '15%',
            sorter: true,
            ellipsis: true,
        },
        form: {
            type: 'input',
            placeholder: 'Nhập mã nhà cung cấp',
            rulesConfig: [
                {
                    type: FormRuleType.Required,
                    message: 'Vui lòng nhập mã nhà cung cấp',
                },
                {
                    type: FormRuleType.Max,
                    max: 20,
                    message: 'Mã nhà cung cấp không được vượt quá 20 ký tự',
                },
                {
                    type: FormRuleType.Code,
                    message: 'Mã nhà cung cấp chỉ được chứa chữ cái thường, số và dấu gạch ngang',
                },
            ],
        },
    },
    BASE_URL: {
        key: 'baseUrl',
        label: 'URL cơ sở',
        table: {
            title: 'URL cơ sở',
            width: '30%',
            sorter: true,
            ellipsis: true,
        },
        form: {
            type: 'input',
            placeholder: 'https://example.com',
            rulesConfig: [
                {
                    type: FormRuleType.Url,
                },
                {
                    type: FormRuleType.Required,
                    message: 'Vui lòng nhập URL cơ sở',
                },
            ],
        },
    },
    CREATED_AT: {
        key: 'createdAt',
        label: 'Ngày tạo',
        table: {
            title: 'Ngày tạo',
            width: '15%',
            sorter: true,
        },
    },
} as const satisfies Record<string, IFieldMetadata>;
