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

    /**
     * Tạo URL để xin quyền Google Auth
     */
    getGoogleAuthUrl(): string {
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
            redirect_uri: this.REDIRECT_URI,
            client_id: this.GOOGLE_CLIENT_ID,
        });

        const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
        return url;
    }

    /**
     * Lấy tokens từ authorization code
     */
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

    /**
     * Refresh access token
     */
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

    /**
     * Lấy thông tin user profile từ Google
     */
    async getUserProfile(accessToken: string): Promise<NGoogleAuth.IGoogleUserProfile | null> {
        try {
            const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user profile');
            }

            const userProfile = await response.json();
            return userProfile;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }
    }

    /**
     * Kiểm tra quyền truy cập của user
     */
    async checkUserPermissions(accessToken: string): Promise<NGoogleAuth.IUserPermissions> {
        try {
            // Kiểm tra quyền Google Drive
            const driveResponse = await fetch(
                'https://www.googleapis.com/drive/v3/about?fields=user',
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                },
            );

            const hasDriveAccess = driveResponse.ok;

            // Có thể thêm các kiểm tra quyền khác ở đây
            return {
                hasDriveAccess,
                isAuthorized: hasDriveAccess, // Có thể mở rộng logic này
                permissions: hasDriveAccess ? ['drive'] : [],
            };
        } catch (error) {
            console.error('Error checking user permissions:', error);
            return {
                hasDriveAccess: false,
                isAuthorized: false,
                permissions: [],
            };
        }
    }

    /**
     * Revoke access token
     */
    async revokeAccess(accessToken: string): Promise<boolean> {
        try {
            const response = await fetch(
                `https://oauth2.googleapis.com/revoke?token=${accessToken}`,
                {
                    method: 'POST',
                },
            );

            return response.ok;
        } catch (error) {
            console.error('Error revoking access:', error);
            return false;
        }
    }

    /**
     * Validate access token
     */
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
