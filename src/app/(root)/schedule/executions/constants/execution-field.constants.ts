import type { IFieldMetadata } from '@/interfaces';

export const EXECUTION_FIELDS = {
    EXECUTION_SERVICE: {
        key: 'executionService',
        label: 'Loại dịch vụ',
        table: {
            title: 'Loại dịch vụ',
            width: 150,
            ellipsis: true,
        },
    },
    TYPE: {
        key: 'type',
        label: 'Loại lịch biểu',
        table: {
            title: 'Loại lịch biểu',
            width: 150,
            ellipsis: true,
        },
    },
    CRON_EXPRESSION: {
        key: 'cronExpression',
        label: 'Lịch biểu cron',
        table: {
            title: 'Lịch biểu cron',
            width: 150,
            ellipsis: true,
        },
    },
    NEXT_RUN_AT: {
        key: 'nextRunAt',
        label: 'Chạy gần nhất',
        table: {
            title: 'Chạy gần nhất',
            width: 400,
            sorter: true,
        },
    },
    LAST_RUN_AT: {
        key: 'lastRunAt',
        label: 'Chạy cuối cùng',
        table: {
            title: 'Chạy cuối cùng',
            width: 400,
            sorter: true,
        },
    },
    JOB_COUNT: {
        key: 'jobCount',
        label: 'Công việc',
        table: {
            title: 'Công việc',
            width: 200,
            align: 'center',
        },
    },
    IS_ACTIVE: {
        key: 'isActive',
        label: 'Trạng thái',
        table: {
            title: 'Trạng thái',
            width: 200,
            align: 'center',
        },
    },
} as const satisfies Record<string, IFieldMetadata>;
