import type { IGoogleDriveFolder } from '@/app/(root)/google/drive/folders/types';

export interface IGoogleAuth {
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

export interface IGoogleDriveFile {
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
    metadata?: Record<string, unknown>;
    googleDriveFolder?: IGoogleDriveFolder;
}

export interface IGoogleDrivePreviewItem {
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

export interface ILocalFilePreviewItem {
    name: string;
    file?: File;
    handle?: unknown;
    size?: number;
    mimeType?: string;
    lastModified?: Date;
}

export interface IPreviewGoogleDriveData {
    data: IGoogleDrivePreviewItem[];
    totalSize: number;
    totalCount: number;
    hasMore: boolean;
    nextPageToken?: string;
}

export interface IFileTag {
    name: string;
    fileTags?: IFileTag[];
}

export interface IGoogleDriveFileTag {
    fileTagId: string;
    googleDriveFileId: string;
}

export type PhotoRecord = IGoogleDriveFile;
