import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            role?: string;
            accessToken?: string;
            refreshToken?: string;
        } & DefaultSession['user'];
    }

    interface User extends DefaultUser {
        role?: string;
        accessToken?: string;
        refreshToken?: string;
    }

    interface JWT {
        role?: string;
        error?: string;
        accessToken?: string;
        refreshToken?: string;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        role?: string;
        error?: string;
        accessToken?: string;
        refreshToken?: string;
    }
}
