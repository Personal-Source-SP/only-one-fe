export declare namespace NGoogle {
    interface IGoogleExchangeCodeRequest {
        access_token: string;
        expires_in: number;
        scope: string;
        token_type: string;
        refresh_token?: string;
        refresh_token_expires_in?: number;
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

    interface IPreviewGoogleDriveData {
        data: IGoogleDrivePreviewItem[];
        totalSize: number;
        totalCount: number;
        hasMore: boolean;
        nextPageToken?: string;
    }

    interface IGoogleAuth {
        id: string;
        userId: string;
        googleAccessToken: string;
        googleExpiresAt: Date;
        isActive: boolean;

        googleRefreshToken?: string;
        googleScope?: string;
        googleTokenType?: string;
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
        googleAuthId: string;
        googleDriveId: string;
        name: string;

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
