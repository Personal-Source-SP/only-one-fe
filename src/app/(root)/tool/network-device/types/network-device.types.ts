import { Abstract } from '@/interfaces';
import { NetworkDeviceType } from '../enums';

export interface IStreamResolution {
    width: number;
    height: number;
}

export interface IStreamProfile {
    name: string;
    token: string;
    streamUri?: string;
    snapshotUri?: string;
    videoEncoding?: string;
    frameRateLimit?: number;
    resolution?: IStreamResolution;
}

export interface IDeviceInformation {
    model?: string;
    hardwareId?: string;
    manufacturer?: string;
    serialNumber?: string;
    firmwareVersion?: string;
}

export interface IOnvifMetadata {
    scopes?: string[];
    xAddrs?: string[];
    streamProfiles?: IStreamProfile[];
    deviceInformation?: IDeviceInformation;
}

export interface INetworkDevice extends Abstract {
    id: string;
    ipAddress: string;
    isOnline: boolean;
    lastSeenAt: string;
    deviceType: NetworkDeviceType;

    openPorts: number[];
    model?: string | null;
    vendor?: string | null;
    macAddress?: string | null;
    firmwareVersion?: string | null;
    onvifMetadata?: IOnvifMetadata | null;
}
