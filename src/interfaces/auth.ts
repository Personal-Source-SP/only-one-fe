export interface IAuthLoginRequest {
    email: string;
    password: string;
}

export interface IAuthPayload {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: string;
    iat: number;
    exp: number;
}

export interface IAuthLoginResponse {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    accessToken: string;
    refreshToken: string;
}

export interface IAuthRefreshResponse {
    accessToken: string;
    refreshToken: string;
}

export interface IAuthRegisterFormValues {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface IAuthForgetPasswordFormValues {
    email: string;
}
