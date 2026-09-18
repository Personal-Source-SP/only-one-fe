// eslint-disable-next-line no-restricted-imports
import type { PresetStatusColorType } from 'antd/es/_util/colors';
import { DiscoverySessionStatus, DiscoveryUrlStatus, ValidationMatchResult } from '../enums';

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

export const DISCOVERY_URL_STATUS_COLOR_MAP: Record<
    DiscoveryUrlStatus,
    PresetStatusColorType | string
> = {
    [DiscoveryUrlStatus.DISCOVERED]: 'default',
    [DiscoveryUrlStatus.QUEUED]: 'processing',
    [DiscoveryUrlStatus.SCRAPED]: 'success',
    [DiscoveryUrlStatus.FAILED]: 'error',
};

export const DISCOVERY_URL_STATUS_LABELS: Record<DiscoveryUrlStatus, string> = {
    [DiscoveryUrlStatus.DISCOVERED]: 'Đã phát hiện',
    [DiscoveryUrlStatus.QUEUED]: 'Đang trong hàng đợi',
    [DiscoveryUrlStatus.SCRAPED]: 'Đã cào thành công',
    [DiscoveryUrlStatus.FAILED]: 'Thất bại',
};

export const VALIDATION_MATCH_RESULT_COLOR_MAP: Record<
    ValidationMatchResult,
    PresetStatusColorType | string
> = {
    [ValidationMatchResult.EXACT_MATCH]: 'green',
    [ValidationMatchResult.PARTIAL_MATCH]: 'orange',
    [ValidationMatchResult.NO_MATCH]: 'red',
};

export const VALIDATION_MATCH_RESULT_LABELS: Record<ValidationMatchResult, string> = {
    [ValidationMatchResult.EXACT_MATCH]: 'Khớp chính xác',
    [ValidationMatchResult.PARTIAL_MATCH]: 'Khớp một phần',
    [ValidationMatchResult.NO_MATCH]: 'Không khớp',
};
