export declare namespace NGoogle {
    interface IGoogleExchangeCodeRequest {
        access_token: string;
        expires_in: number;
        scope: string;
        token_type: string;
        refresh_token?: string;
        refresh_token_expires_in?: number;
    }

    interface IGoogleUserInfo {
        id: string;
        email: string;
        verified_email: boolean;
        name: string;
        given_name: string;
        family_name: string;
        picture: string;
    }

    interface IGoogleDrivePreviewItem {
        name: string;
        googleDriveId: string;
        mimeType?: string;
        size?: number;
        webViewLink?: string;
        webContentLink?: string;
        thumbnailLink?: string;
        parentFolderId?: string;
        lastModified?: Date;
        isTrashed?: boolean;
        isStarred?: boolean;
    }

    interface ILocalFilePreviewItem {
        name: string;
        file?: File;
        handle?: any;
        size?: number;
        mimeType?: string;
        lastModified?: Date;
    }

    interface IPreviewGoogleDriveData {
        data: IGoogleDrivePreviewItem[];
        totalSize: number;
        totalCount: number;
        hasMore: boolean;
        nextPageToken?: string;
    }

    interface IGoogleAuth {
        id: string;
        email: string;
        userId: string;
        isActive: boolean;
        googleExpiresAt: Date;
        googleAccessToken: string;

        googleScope?: string;
        googleTokenType?: string;
        googleRefreshToken?: string;
    }

    interface IGoogleDriveFile {
        id: string;
        googleAuthId: string;
        googleDriveId: string;
        name: string;

        mimeType?: string;
        size?: number;
        webViewLink?: string;
        webContentLink?: string;
        thumbnailLink?: string;
        parentFolderId?: string;
        googleDriveFolderId?: string;
        lastModified?: Date;
        isTrashed?: boolean;
        isStarred?: boolean;
        metadata?: Record<string, any>;

        googleDriveFolder: IGoogleDriveFolder;
    }

    interface IGoogleDriveFolder {
        id: string;
        name: string;
        googleAuthId: string;
        googleDriveId: string;

        parentFolderId?: string;
        lastModified?: Date;
        isTrashed?: boolean;
        isStarred?: boolean;
    }

    interface IFileTag {
        name: string;
        fileTags?: IFileTag[];
    }

    interface IGoogleDriveFileTag {
        fileTagId: string;
        googleDriveFileId: string;
    }
}
