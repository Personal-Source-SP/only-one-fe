import type { IFieldMetadata } from '@/interfaces';
import { FormRuleType } from '@/utilities';

export const USER_FIELDS = {
    EMAIL: {
        key: 'email',
        label: 'Email',
        table: {
            title: 'Email',
            width: '25%',
            sorter: true,
            ellipsis: true,
        },
        form: {
            type: 'input',
            placeholder: 'Nhập email',
            rulesConfig: [
                {
                    type: FormRuleType.Required,
                    message: 'Vui lòng nhập email',
                },
                {
                    type: FormRuleType.Email,
                    message: 'Email không đúng định dạng',
                },
            ],
        },
    },
    USER_NAME: {
        key: 'userName',
        label: 'Tên người dùng',
        table: {
            title: 'Tên người dùng',
            width: '25%',
            sorter: true,
            ellipsis: true,
        },
        form: {
            type: 'input',
            placeholder: 'Nhập tên người dùng',
            rulesConfig: [
                {
                    type: FormRuleType.Required,
                    message: 'Vui lòng nhập tên người dùng',
                },
            ],
        },
    },
    IS_ACTIVE: {
        key: 'isActive',
        label: 'Trạng thái',
        table: {
            title: 'Trạng thái',
            width: '15%',
            align: 'center',
        },
        form: {
            type: 'switch',
        },
    },
    GOOGLE_AUTH: {
        key: 'googleAuths',
        label: 'Kết nối Google',
        table: {
            title: 'Kết nối Google',
            width: '15%',
            align: 'center',
        },
    },
    CREATED_AT: {
        key: 'createdAt',
        label: 'Ngày tạo',
        table: {
            title: 'Ngày tạo',
            width: '20%',
            sorter: true,
        },
    },
} as const satisfies Record<string, IFieldMetadata>;
