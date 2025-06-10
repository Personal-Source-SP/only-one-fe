import NextAuth from 'next-auth';

declare module 'next-auth' {
    interface User {
        role?: string;
        accessToken?: string;
        refreshToken?: string;
    }
    interface Session {
        accessToken?: string;
        refreshToken?: string;
        error?: string;
    }
    interface JWT {
        accessToken?: string;
        refreshToken?: string;
        error?: string;
        role?: string;
    }
}
