export declare namespace NGoogleAuth {
    interface IGoogleTokens {
        scope: string;
        token_type: string;
        access_token: string;
        expires_in: number;
        refresh_token: string;
        refresh_token_expires_in: number;
    }

    interface IGoogleUserProfile {
        id: string;
        email: string;
        verified_email: boolean;
        name: string;
        given_name: string;
        family_name: string;
        picture: string;
        locale: string;
        hd?: string;
    }

    interface IUserPermissions {
        hasDriveAccess: boolean;
        isAuthorized: boolean;
        permissions: string[];
    }

    interface IAuthState {
        isAuthenticated: boolean;
        user: IGoogleUserProfile | null;
        tokens: IGoogleTokens | null;
        permissions: IUserPermissions | null;
        loading: boolean;
        error: string | null;
    }
}
