import { IAuth } from '@/interfaces/auth';
import { UserAuthService } from './user-auth.service';

class AuthService {
    async login(credentials: { email: string; password: string }): Promise<IAuth.ILoginResponse> {
        const result = await UserAuthService.loginWithEmailPassword(
            credentials.email,
            credentials.password,
        );

        if (!result.success || !result.user) {
            throw new Error(result.error || 'Login failed');
        }

        // Generate mock tokens for now - in real implementation, these would come from your auth server
        const accessToken = `mock_access_token_${Date.now()}`;
        const refreshToken = `mock_refresh_token_${Date.now()}`;

        return {
            accessToken,
            refreshToken,
            user: {
                id: result.user.id,
                email: result.user.email,
                firstName: result.user.name.split(' ')[0] || '',
                lastName: result.user.name.split(' ').slice(1).join(' ') || '',
                avatar: result.user.picture,
                role: result.user.role,
            },
        };
    }

    async refreshToken(refreshToken: string): Promise<IAuth.IRefreshResponse | null> {
        try {
            // In a real implementation, this would call your auth server to refresh the token
            // For now, return mock tokens
            const newAccessToken = `mock_access_token_${Date.now()}`;
            const newRefreshToken = `mock_refresh_token_${Date.now()}`;

            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            };
        } catch (error) {
            console.error('Token refresh failed:', error);
            return null;
        }
    }

    async logout(refreshToken: string): Promise<void> {
        try {
            // In a real implementation, this would call your auth server to invalidate the token
            console.log('Logout with refresh token:', refreshToken);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }
}

export const authService = new AuthService();
