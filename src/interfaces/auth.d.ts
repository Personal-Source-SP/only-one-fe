export declare namespace IAuth {
    interface IPayload {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        avatar?: string;
        role: string;
        iat: number;
        exp: number;
    }

    interface ILoginResponse {
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            avatar?: string;
            role: string;
        };
    }

    interface IRefreshResponse {
        accessToken: string;
        refreshToken: string;
    }
}
