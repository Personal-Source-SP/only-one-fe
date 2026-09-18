import type { IFieldMetadata } from '@/interfaces';
import { FormRuleType } from '@/utilities';

export const ITEM_FIELDS = {
    NAME: {
        key: 'name',
        label: 'Tên đối tượng',
        table: {
            title: 'Tên đối tượng',
            width: '25%',
            sorter: true,
            ellipsis: true,
        },
        form: {
            type: 'input',
            placeholder: 'Nhập tên đối tượng',
            rulesConfig: [
                {
                    type: FormRuleType.Required,
                    message: 'Vui lòng nhập tên đối tượng',
                },
                {
                    type: FormRuleType.Max,
                    max: 255,
                    message: 'Tên đối tượng không được vượt quá 255 ký tự',
                },
            ],
        },
    },
    MAPPING_STATUS: {
        key: 'mappingStatus',
        label: 'Trạng thái ánh xạ',
        table: {
            title: 'Trạng thái ánh xạ',
            width: '15%',
        },
    },
    CODE: {
        key: 'code',
        label: 'Mã',
        table: {
            title: 'Mã',
            width: '15%',
            align: 'center',
        },
        form: {
            type: 'input',
            placeholder: 'Nhập mã đối tượng',
            rulesConfig: [
                {
                    type: FormRuleType.Required,
                    message: 'Vui lòng nhập mã đối tượng',
                },
                {
                    type: FormRuleType.Max,
                    max: 20,
                    message: 'Mã đối tượng không được vượt quá 20 ký tự',
                },
            ],
        },
    },
    TAGS: {
        key: 'tags',
        label: 'Tags',
        table: {
            title: 'Tags',
            width: '20%',
            align: 'center',
        },
        form: {
            type: 'input',
            placeholder: 'Nhập các tag, cách nhau bằng dấu phẩy ","',
            rulesConfig: [
                {
                    type: FormRuleType.Custom,
                    validator: (_: unknown, value: unknown) => {
                        if (
                            value &&
                            typeof value === 'string' &&
                            value.split(',').some((tag) => tag.trim().length === 0 && tag !== '')
                        ) {
                            return Promise.reject(new Error('Tag không được bỏ trống!'));
                        }
                        return Promise.resolve();
                    },
                },
            ],
        },
    },
    CREATED_AT: {
        key: 'createdAt',
        label: 'Ngày tạo',
        table: {
            title: 'Ngày tạo',
            width: '25%',
            sorter: true,
        },
    },
} as const satisfies Record<string, IFieldMetadata>;
