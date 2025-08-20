import { FirebaseDBService } from './firebase-db.service';
import { PasswordService } from '../libs/password';
import { GoogleAuthService } from './google-auth.service';
import { NUser } from '@/interfaces';

export class UserAuthService {
    private static googleAuthService = new GoogleAuthService();

    /**
     * Đăng nhập với email và password
     */
    static async loginWithEmailPassword(
        email: string,
        password: string,
    ): Promise<NUser.ILoginResult> {
        try {
            // Tìm user trong database
            const users = await FirebaseDBService.getDocuments<NUser.IUser>('users', {
                where: [{ field: 'email', operator: '==', value: email }],
                limit: 1,
            });

            if (users.length === 0) {
                return {
                    success: false,
                    error: 'Email không tồn tại trong hệ thống',
                };
            }

            const user = users[0];

            // Kiểm tra user có active không
            if (!user.isActive) {
                return {
                    success: false,
                    error: 'Tài khoản đã bị khóa',
                };
            }

            // Kiểm tra user có password hash không
            if (!user.passwordHash) {
                return {
                    success: false,
                    error: 'Tài khoản này chỉ hỗ trợ đăng nhập bằng Google',
                };
            }

            // Kiểm tra password
            const isPasswordValid = await PasswordService.comparePassword(
                password,
                user.passwordHash,
            );

            if (!isPasswordValid) {
                return {
                    success: false,
                    error: 'Mật khẩu không đúng',
                };
            }

            // Cập nhật lastLoginAt
            await FirebaseDBService.updateDocument('users', user.id, {
                lastLoginAt: new Date(),
                updatedAt: new Date(),
            });

            return {
                success: true,
                user: {
                    ...user,
                    lastLoginAt: new Date(),
                    updatedAt: new Date(),
                },
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: 'Có lỗi xảy ra khi đăng nhập',
            };
        }
    }

    /**
     * Tạo user mới với password
     */
    static async createUserWithPassword(userData: NUser.ICreateUserData): Promise<string> {
        try {
            // Validate password nếu có
            if (userData.password) {
                const validation = PasswordService.validatePasswordStrength(userData.password);
                if (!validation.isValid) {
                    throw new Error(`Password validation failed: ${validation.errors.join(', ')}`);
                }
            }

            // Hash password nếu có
            let passwordHash: string | undefined;
            if (userData.password) {
                passwordHash = await PasswordService.hashPassword(userData.password);
            }

            // Tạo user trong database
            const userId = await FirebaseDBService.addDocument<NUser.IUser>('users', {
                ...userData,
                passwordHash,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            return userId;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    /**
     * Cập nhật password cho user
     */
    static async updateUserPassword(userId: string, newPassword: string): Promise<boolean> {
        try {
            // Validate password
            const validation = PasswordService.validatePasswordStrength(newPassword);
            if (!validation.isValid) {
                throw new Error(`Password validation failed: ${validation.errors.join(', ')}`);
            }

            // Hash password
            const passwordHash = await PasswordService.hashPassword(newPassword);

            // Cập nhật trong database
            await FirebaseDBService.updateDocument('users', userId, {
                passwordHash,
                updatedAt: new Date(),
            });

            return true;
        } catch (error) {
            console.error('Error updating password:', error);
            throw error;
        }
    }

    /**
     * Kiểm tra Google token có còn hạn không
     */
    static async checkGoogleTokenValidity(
        accessToken: string,
        refreshToken?: string,
    ): Promise<{ isValid: boolean; requiresRefresh: boolean; newTokens?: any }> {
        try {
            // Kiểm tra token có hợp lệ không
            const isValid = await this.googleAuthService.validateToken(accessToken);

            if (isValid) {
                return { isValid: true, requiresRefresh: false };
            }

            // Token không hợp lệ, thử refresh nếu có refresh token
            if (refreshToken) {
                const refreshResult = await this.googleAuthService.refreshAccessToken(refreshToken);
                // Fix: refreshResult does not have .success, just check .data
                if (refreshResult.data) {
                    return {
                        isValid: true,
                        requiresRefresh: true,
                        newTokens: refreshResult.data,
                    };
                }
            }

            return { isValid: false, requiresRefresh: false };
        } catch (error) {
            console.error('Error checking Google token validity:', error);
            return { isValid: false, requiresRefresh: false };
        }
    }

    /**
     * Cập nhật Google token cho user
     */
    static async updateUserGoogleTokens(
        userId: string,
        accessToken: string,
        refreshToken: string,
        expiresIn: number,
    ): Promise<boolean> {
        try {
            // Tính thời gian hết hạn
            const expiryTime = new Date(Date.now() + expiresIn * 1000);

            // Cập nhật trong database
            await FirebaseDBService.updateDocument('users', userId, {
                googleTokenExpiry: expiryTime,
                googleRefreshToken: refreshToken,
                updatedAt: new Date(),
            });

            return true;
        } catch (error) {
            console.error('Error updating Google tokens:', error);
            throw error;
        }
    }

    /**
     * Kiểm tra user có cần refresh Google token không
     */
    static async checkUserGoogleTokenStatus(user: NUser.IUser): Promise<{
        needsRefresh: boolean;
        isValid: boolean;
        newTokens?: any;
    }> {
        try {
            // Nếu user không có Google token, không cần refresh
            if (!user.googleRefreshToken) {
                return { needsRefresh: false, isValid: false };
            }

            // Kiểm tra token có hết hạn chưa (trừ 5 phút để đảm bảo an toàn)
            const now = new Date();
            const expiryTime = user.googleTokenExpiry;
            const bufferTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 phút

            if (expiryTime && expiryTime > bufferTime) {
                return { needsRefresh: false, isValid: true };
            }

            // Token sắp hết hạn hoặc đã hết hạn, thử refresh
            const refreshResult = await this.googleAuthService.refreshAccessToken(
                user.googleRefreshToken,
            );

            // Fix: refreshResult does not have .success, just check .data
            if (refreshResult.data) {
                return {
                    needsRefresh: true,
                    isValid: true,
                    newTokens: refreshResult.data,
                };
            }

            return { needsRefresh: true, isValid: false };
        } catch (error) {
            console.error('Error checking user Google token status:', error);
            return { needsRefresh: true, isValid: false };
        }
    }

    /**
     * Đăng nhập với Google và cập nhật thông tin user
     */
    static async loginWithGoogle(googleCode: string): Promise<NUser.ILoginResult> {
        try {
            // Lấy tokens từ Google
            const tokensResult = await this.googleAuthService.getGoogleTokens(googleCode);
            // Fix: tokensResult does not have .success, just check .data
            if (!tokensResult.data) {
                return {
                    success: false,
                    error: 'Không thể lấy tokens từ Google',
                };
            }

            const { access_token, refresh_token, expires_in } = tokensResult.data;

            // Tìm user trong database
            const users = await FirebaseDBService.getDocuments<NUser.IUser>('users', {
                where: [{ field: 'googleId', operator: '==', value: googleCode }],
                limit: 1,
            });

            let user: NUser.IUser;

            if (users.length > 0) {
                // User đã tồn tại, cập nhật thông tin
                user = users[0];

                if (!user.isActive) {
                    return {
                        success: false,
                        error: 'Tài khoản đã bị khóa',
                    };
                }

                // Cập nhật Google tokens và thông tin
                await FirebaseDBService.updateDocument('users', user.id, {
                    googleId: googleCode,
                    googleTokenExpiry: new Date(Date.now() + expires_in * 1000),
                    googleRefreshToken: refresh_token,
                    lastLoginAt: new Date(),
                    updatedAt: new Date(),
                    loginMethod: user.passwordHash ? 'both' : 'google',
                });

                // Lấy user đã cập nhật
                const updatedUser = await FirebaseDBService.getDocument<NUser.IUser>(
                    'users',
                    user.id,
                );
                if (updatedUser) {
                    user = updatedUser;
                }
            } else {
                // Tạo user mới
                const newUserId = await this.createUserWithPassword({
                    email: '',
                    name: '',
                    picture: '',
                    role: 'user',
                    isActive: true,
                    loginMethod: 'google',
                    googleId: googleCode,
                });

                // Cập nhật Google tokens cho user mới
                await this.updateUserGoogleTokens(
                    newUserId,
                    access_token,
                    refresh_token,
                    expires_in,
                );

                // Lấy user mới tạo
                const newUser = await FirebaseDBService.getDocument<NUser.IUser>(
                    'users',
                    newUserId,
                );
                if (!newUser) {
                    return {
                        success: false,
                        error: 'Không thể tạo user mới',
                    };
                }
                user = newUser;
            }

            return {
                success: true,
                user,
            };
        } catch (error) {
            console.error('Google login error:', error);
            return {
                success: false,
                error: 'Có lỗi xảy ra khi đăng nhập với Google',
            };
        }
    }

    /**
     * Reset password cho user
     */
    static async resetUserPassword(
        userId: string,
    ): Promise<{ success: boolean; newPassword?: string; error?: string }> {
        try {
            // Tạo password mới
            const newPassword = PasswordService.generateRandomPassword();

            // Hash password mới
            const passwordHash = await PasswordService.hashPassword(newPassword);

            // Cập nhật trong database
            await FirebaseDBService.updateDocument('users', userId, {
                passwordHash,
                updatedAt: new Date(),
            });

            return {
                success: true,
                newPassword,
            };
        } catch (error) {
            console.error('Error resetting password:', error);
            return {
                success: false,
                error: 'Có lỗi xảy ra khi reset password',
            };
        }
    }
}
