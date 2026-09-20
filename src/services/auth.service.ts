import type { IAuthLoginRequest, IAuthLoginResponse, IAuthRefreshResponse } from '@/interfaces';
import { getApiBaseUrl } from '@/libs';

import { BaseApi } from './base.service';

class AuthService extends BaseApi {
    constructor() {
        super({
            baseURL: getApiBaseUrl(),
        });
    }

    async login(request: IAuthLoginRequest): Promise<IAuthLoginResponse | null> {
        const result = await this.post<IAuthLoginResponse>({
            data: request as unknown as Record<string, unknown>,
            endPoint: '/auth/login',
        });

        return result?.data || null;
    }

    async refreshToken(refreshToken: string): Promise<IAuthRefreshResponse | null> {
        const result = await this.post<IAuthRefreshResponse>({
            data: { refreshToken },
            endPoint: '/auth/refresh-token',
        });

        return result?.data || null;
    }
}

export const authService = new AuthService();
