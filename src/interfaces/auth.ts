export namespace IAuth {
    export interface ILoginRequest {
        email: string;
        password: string;
    }

    export interface IPayload {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        avatar?: string;
        role: string;
        iat: number;
        exp: number;
    }

    export interface ILoginResponse {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        accessToken: string;
        refreshToken: string;
    }

    export interface IRefreshResponse {
        accessToken: string;
        refreshToken: string;
    }

    export interface IRegisterFormValues {
        name: string;
        email: string;
        password: string;
        confirmPassword: string;
    }

    export interface IForgetPasswordFormValues {
        email: string;
    }
}
