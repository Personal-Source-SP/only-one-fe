import { NUser } from '@/interfaces/user';

export declare namespace NGoogle {
    interface IGoogleAuth {
        userId: string;
        googleAccessToken: string;
        googleExpiresAt: Date;
        isActive: boolean;

        googleRefreshToken?: string;
        googleScope?: string;
        googleTokenType?: string;

        user: NUser.IReq;
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
        googleDriveFileId: string;
        fileTagId: string;

        googleDriveFile: IGoogleDriveFile;
        fileTag: IFileTag;
    }
}
