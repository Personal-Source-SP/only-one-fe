import { auth } from '@/libs/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import type { Awaitable, User } from 'next-auth';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

function isTokenExpired(token: string): boolean {
    try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        return Date.now() >= payload.exp * 1000;
    } catch {
        return true;
    }
}

const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: 'credentials',
            credentials: { email: {}, password: {} },
            async authorize(credentials: { email: string; password: string } | undefined) {
                if (!credentials) return null;

                try {
                    const response = await signInWithEmailAndPassword(
                        auth,
                        credentials.email,
                        credentials.password,
                    );

                    const firebaseUser = response?.user;
                    const accessToken = await firebaseUser.getIdToken();
                    const user: Awaitable<User> = {
                        id: firebaseUser?.uid,
                        email: firebaseUser?.email,
                        image: firebaseUser?.photoURL,
                        name: firebaseUser?.displayName,
                        accessToken,
                    };

                    return user;
                } catch (error: unknown) {
                    console.log('error', error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            // return token;
            // please dont remove this console log
            console.log('JWT callback', { token, user });

            const typedUser = user as User | undefined;
            const typedToken = token as any;

            if (typedUser) {
                // Initial sign in
                return {
                    ...typedToken,
                    role: typedUser.role,
                    accessToken: typedUser.accessToken,
                };
            }

            // On subsequent calls, check if access token needs refresh
            if (typedToken.accessToken && isTokenExpired(typedToken.accessToken as string)) {
                console.log('Access token expired, logging out user...');
                return {
                    ...typedToken,
                    error: 'AccessTokenExpired',
                };
            }

            return typedToken;
        },

        async session({ session, token }) {
            // please dont remove this console log
            console.log('Session callback', { session, token });

            if (token.error === 'AccessTokenExpired') {
                // Return error in session to trigger sign out on client side
                return {
                    ...session,
                    error: 'AccessTokenExpired',
                };
            }

            return {
                ...session,
                accessToken: (token as any).accessToken,
            };
        },
    },
    events: {
        async signOut() {
            // Không cần xử lý refreshToken khi logout nữa
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
