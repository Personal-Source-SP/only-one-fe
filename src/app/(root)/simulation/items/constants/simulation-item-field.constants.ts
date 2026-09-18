import type { IFieldMetadata } from '@/interfaces';

export const SIMULATION_ITEM_FIELDS = {
    STATUS: {
        key: 'status',
        label: 'Trạng thái',
        table: {
            title: 'Trạng thái',
            width: 130,
            align: 'center',
        },
    },
    EXPIRES_AT: {
        key: 'expiresAt',
        label: 'Hết hạn',
        table: {
            title: 'Hết hạn',
            width: 200,
            sorter: true,
        },
    },
} as const satisfies Record<string, IFieldMetadata>;
