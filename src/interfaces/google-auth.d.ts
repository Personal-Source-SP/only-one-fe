export declare namespace NGoogleAuth {
    interface IGoogleTokens {
        scope: string;
        token_type: string;
        expires_in: number;
        access_token: string;
        refresh_token: string;
        refresh_token_expires_in: number;
    }

    interface IAuthState {
        loading: boolean;
        error: string | null;
        isAuthenticated: boolean;
        tokens: IGoogleTokens | null;
    }
}
