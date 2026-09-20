import { NetworkScanStatus } from '../enums';

export const SCAN_STATUS_CONFIG: Record<
    NetworkScanStatus,
    { label: string; status: 'default' | 'processing' | 'success' | 'error'; color: string }
> = {
    [NetworkScanStatus.IDLE]: {
        label: 'Sẵn sàng',
        status: 'default',
        color: 'default',
    },
    [NetworkScanStatus.SCANNING]: {
        label: 'Đang quét mạng...',
        status: 'processing',
        color: 'processing',
    },
    [NetworkScanStatus.COMPLETED]: {
        label: 'Quét hoàn tất',
        status: 'success',
        color: 'success',
    },
    [NetworkScanStatus.FAILED]: {
        label: 'Quét thất bại',
        status: 'error',
        color: 'error',
    },
};

export const SCAN_STATUS_ALERT_TYPE_MAP: Record<NetworkScanStatus, 'info' | 'success' | 'error'> = {
    [NetworkScanStatus.SCANNING]: 'info',
    [NetworkScanStatus.COMPLETED]: 'success',
    [NetworkScanStatus.FAILED]: 'error',
    [NetworkScanStatus.IDLE]: 'info',
};
