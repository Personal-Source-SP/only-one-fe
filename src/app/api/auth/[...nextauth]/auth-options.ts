import { IAuth } from '@/interfaces/auth';
import { authService } from '@/services/auth.service';
import { AxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';
import type { Awaitable, User } from 'next-auth';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const checkTokenExpired = (token: string): boolean => {
    if (!token) return true;

    try {
        const decoded = jwtDecode<{ exp: number }>(token);

        const bufferTime = 0; // seconds

        return decoded.exp < Date.now() / 1000 + bufferTime;
    } catch {
        return true;
    }
};

interface IAuthorizeCredentials {
    email: string;
    password: string;
}

const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: 'credentials',
            credentials: { email: {}, password: {} },
            async authorize(credentials?: IAuthorizeCredentials): Promise<User | null> {
                if (!credentials) return null;

                try {
                    const response = await authService.login({
                        email: credentials.email,
                        password: credentials.password,
                    });

                    if (!response) {
                        throw new Error('error.auth.invalidCredentials');
                    }

                    const { accessToken, refreshToken } = response;

                    const decodedAccessToken = jwtDecode<IAuth.IPayload>(accessToken);

                    const user: Awaitable<User> = {
                        ...decodedAccessToken,
                        accessToken: accessToken,
                        refreshToken: refreshToken,
                        image: decodedAccessToken.avatar,
                        name: `${decodedAccessToken.firstName} ${decodedAccessToken.lastName}`,
                    };

                    return user;
                } catch (error: unknown) {
                    if (error instanceof AxiosError) {
                        if (error.response?.data?.message === 'recaptcha_error') {
                            throw new Error(error.response?.data?.errorCode);
                        }

                        throw new Error('error.auth.invalidCredentials');
                    }

                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                // Initial sign in
                return {
                    ...token,
                    role: user.role,
                    accessToken: user.accessToken,
                    refreshToken: user.refreshToken,
                };
            }

            if (token.accessToken && checkTokenExpired(token.accessToken as string)) {
                const refreshResult = await authService.refreshToken(token.refreshToken as string);

                if (!refreshResult) {
                    return {
                        ...token,
                        error: 'RefreshAccessTokenError',
                    };
                }

                return {
                    ...token,
                    accessToken: refreshResult.accessToken,
                    refreshToken: refreshResult.refreshToken,
                };
            }

            return token;
        },

        async session({ session, token }) {
            if (token.error === 'RefreshAccessTokenError') {
                return {
                    ...session,
                    error: 'RefreshAccessTokenError',
                };
            }

            return {
                ...session,
                accessToken: token.accessToken,
                refreshToken: token.refreshToken,
            };
        },
    },
    events: {
        async signOut({ token }) {
            console.log('signOut', token);
        },
    },
    secret: process.env.NEXTAUTH_SECRET as string,
    session: {
        strategy: 'jwt',
        // # 30 days
        // maxAge: 60,
        // # 5 minutes, default is 1 day
        // updateAge: 120,
    },
    jwt: {
        // 1 hours
        // maxAge: 1 * 60 * 60,
        // maxAge: 60,
    },
    debug: true,
};

export default authOptions;
