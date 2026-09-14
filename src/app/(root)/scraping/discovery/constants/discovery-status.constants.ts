// eslint-disable-next-line no-restricted-imports
import type { PresetStatusColorType } from 'antd/es/_util/colors';
import { DiscoverySessionStatus } from '../enums';

export const DISCOVERY_SESSION_STATUS_COLOR_MAP: Record<
    DiscoverySessionStatus,
    PresetStatusColorType | string
> = {
    [DiscoverySessionStatus.COMPLETED]: 'success',
    [DiscoverySessionStatus.IN_PROGRESS]: 'processing',
    [DiscoverySessionStatus.FAILED]: 'error',
    [DiscoverySessionStatus.PENDING]: 'default',
};

export const DISCOVERY_SESSION_STATUS_LABELS: Record<DiscoverySessionStatus, string> = {
    [DiscoverySessionStatus.COMPLETED]: 'Hoàn thành',
    [DiscoverySessionStatus.IN_PROGRESS]: 'Đang xử lý',
    [DiscoverySessionStatus.FAILED]: 'Thất bại',
    [DiscoverySessionStatus.PENDING]: 'Chờ xử lý',
};
