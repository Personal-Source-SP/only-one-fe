export type TunnelMode = 'quick' | 'named';
export type TunnelStatus = 'idle' | 'starting' | 'connected' | 'error';

export interface TunnelStatusResponse {
    status: TunnelStatus;
    url: string | null;
    error: string | null;
    mode: TunnelMode | null;
}

export interface TunnelConfigDto {
    mode: TunnelMode;
    token?: string;
    customUrl?: string;
}
