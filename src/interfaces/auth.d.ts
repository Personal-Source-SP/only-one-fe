export declare namespace IAuth {
    interface ILoginRequest {
        email: string;
        password: string;
    }

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
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        accessToken: string;
        refreshToken: string;
    }

    interface IRefreshResponse {
        accessToken: string;
        refreshToken: string;
    }
}
