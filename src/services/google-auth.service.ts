import { NBaseApi, NGoogleAuth } from '@/interfaces';
import BaseApi from '@/services/base.service';

export class GoogleAuthService extends BaseApi {
    private readonly REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}`;
    private readonly GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    private readonly GOOGLE_CLIENT_SECRET = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET;

    constructor() {
        super({
            baseURL: 'https://oauth2.googleapis.com',
        });
    }

    getGoogleAuthUrl(path?: string): string {
        const scopes = [
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
        ];

        const params = this.generateSearchParams({
            prompt: 'consent',
            response_type: 'code',
            access_type: 'offline',
            scope: scopes.join(' '),
            client_id: this.GOOGLE_CLIENT_ID,
            redirect_uri: `${this.REDIRECT_URI}/${path ?? 'dashboard'}`,
        });

        const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
        return url;
    }

    async getGoogleTokens(
        code: string,
        path?: string,
    ): Promise<NBaseApi.IResponse<NGoogleAuth.IGoogleTokens | null>> {
        const params = this.generateSearchParams({
            code,
            grant_type: 'authorization_code',
            client_id: this.GOOGLE_CLIENT_ID,
            client_secret: this.GOOGLE_CLIENT_SECRET,
            redirect_uri: `${this.REDIRECT_URI}/${path ?? 'dashboard'}`,
        });

        const response = await this.post<NGoogleAuth.IGoogleTokens>({
            endPoint: 'token',
            data: params,
        });

        return response;
    }

    async refreshAccessToken(
        refreshToken: string,
    ): Promise<NBaseApi.IResponse<NGoogleAuth.IGoogleTokens | null>> {
        const params = this.generateSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: this.GOOGLE_CLIENT_ID,
            client_secret: this.GOOGLE_CLIENT_SECRET,
        });

        const response = await this.post<NGoogleAuth.IGoogleTokens>({
            endPoint: 'token',
            data: params,
        });

        return response;
    }

    async revokeAccess(accessToken: string): Promise<boolean> {
        const params = this.generateSearchParams({
            token: accessToken,
        });

        const response = await this.post<any>({
            endPoint: 'revoke',
            data: params,
        });

        return response ? true : false;
    }

    async validateToken(accessToken: string): Promise<boolean> {
        try {
            const response = await fetch(
                `https://oauth2.googleapis.com/tokeninfo?access_token=${accessToken}`,
            );
            return response.ok;
        } catch (error) {
            console.error('Error validating token:', error);
            return false;
        }
    }
}
