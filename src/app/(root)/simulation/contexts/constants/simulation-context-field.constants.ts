import type { IFieldMetadata } from '@/interfaces';
import { FormRuleType } from '@/utilities';

export const SIMULATION_CONTEXT_FIELDS = {
    NAME: {
        key: 'name',
        label: 'Tên ngữ cảnh',
        table: {
            title: 'Tên ngữ cảnh',
            width: 200,
            ellipsis: true,
        },
        form: {
            type: 'input',
            placeholder: 'Nhập tên ngữ cảnh',
            rulesConfig: [
                {
                    type: FormRuleType.Required,
                    message: 'Vui lòng nhập tên ngữ cảnh',
                },
            ],
        },
    },
    BASE_URL: {
        key: 'baseUrl',
        label: 'URL nguồn',
        table: {
            title: 'URL nguồn',
            width: 220,
            ellipsis: true,
        },
        form: {
            type: 'input',
            placeholder: 'Nhập URL nguồn',
            rulesConfig: [
                {
                    type: FormRuleType.Required,
                    message: 'Vui lòng nhập URL nguồn',
                },
                {
                    type: FormRuleType.Url,
                    message: 'URL không hợp lệ',
                },
            ],
        },
    },
    SERVICE_EXECUTION: {
        key: 'serviceExecution',
        label: 'Dịch vụ thực thi',
        table: {
            title: 'Dịch vụ thực thi',
            width: 180,
        },
        form: {
            type: 'select',
            placeholder: 'Chọn dịch vụ',
            rulesConfig: [
                {
                    type: FormRuleType.Required,
                    message: 'Vui lòng chọn dịch vụ',
                },
            ],
        },
    },
    STATUS: {
        key: 'status',
        label: 'Trạng thái',
        table: {
            title: 'Trạng thái',
            width: 130,
            align: 'center',
        },
    },
    LAST_SUCCESSFUL_RUN_AT: {
        key: 'lastSuccessfulRunAt',
        label: 'Chạy gần nhất',
        table: {
            title: 'Chạy gần nhất',
            width: 200,
            sorter: true,
        },
    },
} as const satisfies Record<string, IFieldMetadata>;
