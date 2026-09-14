import type { TunnelConfigDto, TunnelStatusResponse } from '../types';

export const DEFAULT_TUNNEL_CONFIG: TunnelConfigDto = {
    mode: 'quick',
    token: '',
    customUrl: '',
};

export const DEFAULT_TUNNEL_STATUS: TunnelStatusResponse = {
    status: 'idle',
    url: null,
    mode: null,
    error: null,
};
