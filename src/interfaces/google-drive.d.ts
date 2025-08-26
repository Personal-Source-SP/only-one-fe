export declare namespace NGoogleDrive {
    // ***Request***
    interface ListFilesRequest {
        q?: string;
        pageSize?: number;
        pageToken?: string;
        orderBy?: string;
        spaces?: string;
        fields?: string;
    }

    interface GetFileRequest {
        fileId: string;
        fields?: string;
    }

    interface CreateFileRequest {
        name: string;
        parents?: string[];
        mimeType?: string;
    }

    interface UpdateFileOptions {
        name?: string;
        parents?: string[];
    }

    interface UpdateFileRequest {
        fileId: string;
        updates: UpdateFileOptions;
        content?: Blob | File;
    }

    interface ExportFileRequest {
        fileId: string;
        mimeType: string;
    }

    interface CreateFolderRequest {
        name: string;
        parentId?: string;
    }

    interface CreateDriveRequest {
        name: string;
        requestId: string;
    }

    interface UpdateDriveRequest {
        driveId: string;
        updates: {
            name?: string;
            quotaBytesTotal?: string;
            quotaBytesUsed?: string;
            quotaBytesUsedAggregate?: string;
        };
    }

    interface SearchFileRequest {
        query: string;
        options?: Omit<ListFilesRequest, 'q'>;
    }

    interface MoveFileToFolderRequest {
        fileId: string;
        newParentId: string;
        oldParentId?: string;
    }

    // ***Response***
    interface DriveFileResponse {
        id: string;
        name: string;
        mimeType: string;
        parents?: string[];
        size?: string;
        createdTime?: string;
        modifiedTime?: string;
        webViewLink?: string;
        webContentLink?: string;
        thumbnailLink?: string;
        iconLink?: string;
        shared?: boolean;
        owners?: Array<{
            displayName: string;
            emailAddress: string;
        }>;
    }

    interface ListFilesResponse {
        files: DriveFileResponse[];
        nextPageToken?: string;
    }

    interface DriveFolderResponse {
        id: string;
        name: string;
        parents?: string[];
        createdTime?: string;
        modifiedTime?: string;
    }

    interface ListDriveFolderResponse {
        files: DriveFolderResponse[];
        nextPageToken?: string;
        incompleteSearch?: boolean;
    }

    interface DriveResponse {
        id: string;
        name: string;
        createdTime?: string;
        modifiedTime?: string;
        quotaBytesTotal?: string;
        quotaBytesUsed?: string;
        quotaBytesUsedAggregate?: string;
    }
}
