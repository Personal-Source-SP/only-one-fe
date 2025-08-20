export declare namespace NUser {
    interface IUser {
        id: string;
        email: string;
        name: string;
        picture?: string;
        role: 'admin' | 'user';
        isActive: boolean;
        passwordHash?: string; // Hash của password (chỉ cho email/password login)
        createdAt: Date;
        updatedAt: Date;
        lastLoginAt?: Date;
        googleId?: string;
        firebaseUid?: string;
        googleTokenExpiry?: Date; // Thời gian hết hạn của Google token
        googleRefreshToken?: string; // Refresh token của Google
        loginMethod: 'email' | 'google' | 'both'; // Phương thức đăng nhập chính
    }

    interface ICreateUserData {
        email: string;
        name: string;
        picture?: string;
        role: 'admin' | 'user';
        isActive: boolean;
        password?: string; // Plain password (sẽ được hash)
        googleId?: string;
        firebaseUid?: string;
        loginMethod: 'email' | 'google' | 'both';
    }

    interface IUpdateUserData {
        name?: string;
        picture?: string;
        role?: 'admin' | 'user';
        isActive?: boolean;
        password?: string; // Plain password (sẽ được hash)
        passwordHash?: string; // Hashed password
        lastLoginAt?: Date;
        googleTokenExpiry?: Date;
        googleRefreshToken?: string;
        loginMethod?: 'email' | 'google' | 'both';
    }

    interface ILoginCredentials {
        email: string;
        password: string;
    }

    interface ILoginResult {
        success: boolean;
        user?: IUser;
        error?: string;
        requiresGoogleRefresh?: boolean;
    }
}
