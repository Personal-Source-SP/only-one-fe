import { IAuth } from '@/interfaces';
import { BaseApi } from './base.service';

class AuthService extends BaseApi {
    constructor() {
        super({
            baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1',
        });
    }

    async login(request: IAuth.ILoginRequest): Promise<IAuth.ILoginResponse | null> {
        const result = await this.post<IAuth.ILoginResponse>({
            data: request,
            endPoint: '/auth/login',
        });

        return result?.data || null;
    }

    async refreshToken(refreshToken: string): Promise<IAuth.IRefreshResponse | null> {
        const result = await this.post<IAuth.IRefreshResponse>({
            data: { refreshToken },
            endPoint: '/auth/refresh-token',
        });

        return result?.data || null;
    }
}

export const authService = new AuthService();
