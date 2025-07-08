import { NBaseApi, NGoogleAuth } from '@/interfaces';
import BaseApi from '@/services/base.service';

export class GoogleAuthService extends BaseApi {
    private readonly GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    private readonly REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;
    private readonly GOOGLE_CLIENT_SECRET = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET;

    constructor() {
        super({
            baseURL: 'https://oauth2.googleapis.com',
        });
    }

    getGoogleAuthUrl(): string {
        const scopes = ['https://www.googleapis.com/auth/drive'];

        const params = this.generateSearchParams({
            prompt: 'consent',
            response_type: 'code',
            access_type: 'offline',
            scope: scopes.join(' '),
            redirect_uri: this.REDIRECT_URI,
            client_id: this.GOOGLE_CLIENT_ID,
        });

        const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

        return url;
    }

    async getGoogleTokens(
        code: string,
    ): Promise<NBaseApi.IResponse<NGoogleAuth.IGoogleTokens | null>> {
        const params = this.generateSearchParams({
            code,
            grant_type: 'authorization_code',
            redirect_uri: this.REDIRECT_URI,
            client_id: this.GOOGLE_CLIENT_ID,
            client_secret: this.GOOGLE_CLIENT_SECRET,
        });

        const response = await this.post<NGoogleAuth.IGoogleTokens>({
            endPoint: 'token',
            data: params,
        });

        return response;
    }
}
