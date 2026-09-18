import type { IFieldMetadata } from '@/interfaces';

export const NETWORK_DEVICE_FIELDS = {
    IP_ADDRESS: {
        key: 'ipAddress',
        label: 'Địa chỉ IP',
        table: {
            title: 'Địa chỉ IP',
            width: 150,
            sorter: true,
        },
    },
    DEVICE_TYPE: {
        key: 'deviceType',
        label: 'Loại thiết bị',
        table: {
            title: 'Loại thiết bị',
            width: 150,
        },
    },
    STATUS: {
        key: 'isOnline',
        label: 'Trạng thái',
        table: {
            title: 'Trạng thái',
            width: 120,
            align: 'center',
        },
    },
    LAST_SEEN_AT: {
        key: 'lastSeenAt',
        label: 'Nhìn thấy gần nhất',
        table: {
            title: 'Nhìn thấy gần nhất',
            width: 180,
            sorter: true,
        },
    },
} as const satisfies Record<string, IFieldMetadata>;
