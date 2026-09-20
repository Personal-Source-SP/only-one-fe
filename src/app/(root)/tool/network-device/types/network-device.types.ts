import { IAbstract } from '@/interfaces';

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

export interface INetworkDevice extends IAbstract {
    ipAddress: string;
    isOnline: boolean;
    lastSeenAt: string;
    openPorts: number[];
    deviceType: NetworkDeviceType;

    model?: string;
    vendor?: string;
    macAddress?: string;
    firmwareVersion?: string;
    onvifMetadata?: IOnvifMetadata;
}
