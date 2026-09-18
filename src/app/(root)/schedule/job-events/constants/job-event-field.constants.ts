import type { IFieldMetadata } from '@/interfaces';

export const JOB_EVENT_FIELDS = {
    EVENT_TYPE: {
        key: 'eventType',
        label: 'Loại sự kiện',
        table: {
            title: 'Loại sự kiện',
            width: 150,
            ellipsis: true,
        },
    },
    EVENT_MESSAGE: {
        key: 'eventMessage',
        label: 'Nội dung sự kiện',
        table: {
            title: 'Nội dung sự kiện',
            width: 150,
            ellipsis: true,
        },
    },
    STARTED_AT: {
        key: 'startedAt',
        label: 'Bắt đầu',
        table: {
            title: 'Bắt đầu',
            width: 200,
            sorter: true,
        },
    },
    FINISHED_AT: {
        key: 'finishedAt',
        label: 'Kết thúc',
        table: {
            title: 'Kết thúc',
            width: 200,
            sorter: true,
        },
    },
    RETRY_COUNT: {
        key: 'retryCount',
        label: 'Số lần thử',
        table: {
            title: 'Số lần thử',
            width: 100,
            align: 'center',
        },
    },
} as const satisfies Record<string, IFieldMetadata>;
