import { NetworkDeviceApproachEnum, NetworkScanStatus } from '../enums';

export interface IScanStatusResponse {
    status: NetworkScanStatus;
    devicesDiscoveredCount: number;
    startedAt?: string | null;
    completedAt?: string | null;
}

export interface ITriggerScanRequest {
    subnet?: string;
    probeTimeoutMs?: number;
}

export interface IDeviceCredential {
    username: string;
    port?: number;
    password?: string;
    protocol?: string;
}

export interface IExecuteApproachRequest {
    approach: NetworkDeviceApproachEnum;
    ip?: string;
    mac?: string;
    subnet?: string;
    ports?: number[];
    timeoutMs?: number;
    credentials?: IDeviceCredential[];
}

export interface INetworkDeviceTarget {
    ip?: string;
    mac?: string;
    subnet?: string;
}

export interface IApproachResultResponse<TData = any> {
    isSuccess: boolean;
    responseTimeMs: number;
    target: INetworkDeviceTarget;
    approach: NetworkDeviceApproachEnum;
    data?: TData;
    errorMessage?: string;
    matchedCredential?: IDeviceCredential;
}
