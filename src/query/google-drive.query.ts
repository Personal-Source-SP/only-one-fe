import {
    useQuery,
    useMutation,
    useQueryClient,
    UseQueryOptions,
    keepPreviousData,
} from '@tanstack/react-query';
import { NGoogleDrive, NBaseApi } from '@/interfaces';
import BaseApi from '@/services/base.service';

// Inline Google Drive API client (replaces GoogleDriveService)
const http = new BaseApi({
    baseURL: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_URL || 'https://www.googleapis.com/drive/v3',
});

const driveKeys = {
    all: ['googleDrive'] as const,
    listFiles: (request?: NGoogleDrive.ListFilesRequest) =>
        [...(['googleDrive'] as const), 'listFiles', request] as const,
    getFile: (request?: NGoogleDrive.GetFileRequest) =>
        [...(['googleDrive'] as const), 'getFile', request] as const,
    downloadFile: (fileId?: string) =>
        [...(['googleDrive'] as const), 'downloadFile', fileId] as const,
    exportFile: (request?: NGoogleDrive.ExportFileRequest) =>
        [...(['googleDrive'] as const), 'exportFile', request] as const,
    listFolders: (parentId?: string) =>
        [...(['googleDrive'] as const), 'listFolders', parentId] as const,
    listDrives: () => [...(['googleDrive'] as const), 'listDrives'] as const,
    getDrive: (driveId?: string) => [...(['googleDrive'] as const), 'getDrive', driveId] as const,
    searchFiles: (request?: NGoogleDrive.SearchFileRequest) =>
        [...(['googleDrive'] as const), 'searchFiles', request] as const,
    getFilesByName: (name?: string) =>
        [...(['googleDrive'] as const), 'getFilesByName', name] as const,
    getFilesByType: (mimeType?: string) =>
        [...(['googleDrive'] as const), 'getFilesByType', mimeType] as const,
    getFilesInFolder: (folderId?: string) =>
        [...(['googleDrive'] as const), 'getFilesInFolder', folderId] as const,
} as const;

const driveApi = {
    // **********Files API**********
    listFiles: async (
        request?: NGoogleDrive.ListFilesRequest,
    ): Promise<NBaseApi.IResponse<NGoogleDrive.ListFilesResponse | null>> => {
        const params = http.generateSearchParams(request);
        return http.get<NGoogleDrive.ListFilesResponse>({ endPoint: `/files`, params });
    },

    getFile: async (
        request?: NGoogleDrive.GetFileRequest,
    ): Promise<NBaseApi.IResponse<NGoogleDrive.DriveFileResponse | null>> => {
        return http.get<NGoogleDrive.DriveFileResponse>({
            endPoint: `/files/${request?.fileId}`,
            params: http.generateSearchParams(request),
        });
    },

    createFile: async (
        file: NGoogleDrive.CreateFileRequest,
        content?: Blob | File,
    ): Promise<NBaseApi.IResponse<NGoogleDrive.DriveFileResponse | null>> => {
        if (content) {
            const formData = http.generateFormData({
                file: content,
                metadata: new Blob([JSON.stringify(file)], { type: 'application/json' }),
            });

            return http.post<NGoogleDrive.DriveFileResponse>({
                endPoint: '/upload/files?uploadType=multipart',
                data: formData,
                headers: { 'Content-Type': 'multipart/related' },
            });
        }

        return http.post<NGoogleDrive.DriveFileResponse>({ endPoint: '/files', data: file });
    },

    updateFile: async (
        request: NGoogleDrive.UpdateFileRequest,
    ): Promise<NBaseApi.IResponse<NGoogleDrive.DriveFileResponse | null>> => {
        const { fileId, updates, content } = request;
        if (content) {
            const formData = http.generateFormData({
                file: content,
                metadata: new Blob([JSON.stringify(updates)], { type: 'application/json' }),
            });

            return http.patch<NGoogleDrive.DriveFileResponse>({
                endPoint: `/upload/files/${fileId}?uploadType=multipart`,
                data: formData,
                headers: { 'Content-Type': 'multipart/related' },
            });
        }

        return http.patch<NGoogleDrive.DriveFileResponse>({
            endPoint: `/files/${fileId}`,
            data: updates,
        });
    },

    deleteFile: async (fileId: string): Promise<NBaseApi.IResponse<null>> => {
        return http.delete<null>({ endPoint: `/files/${fileId}` });
    },

    copyFile: async (
        request: NGoogleDrive.CopyFileRequest,
    ): Promise<NBaseApi.IResponse<NGoogleDrive.DriveFileResponse | null>> => {
        return http.post<NGoogleDrive.DriveFileResponse>({
            endPoint: `/files/${request.fileId}/copy`,
            data: request.options,
        });
    },

    downloadFile: async (fileId: string): Promise<NBaseApi.IResponse<Blob | null>> => {
        return http.get<Blob>({
            endPoint: `/files/${fileId}`,
            params: http.generateSearchParams({ alt: 'media' }),
        });
    },

    exportFile: async (
        request: NGoogleDrive.ExportFileRequest,
    ): Promise<NBaseApi.IResponse<Blob | null>> => {
        const { fileId, mimeType } = request;
        return http.get<Blob>({
            endPoint: `/files/${fileId}/export`,
            params: http.generateSearchParams({ mimeType }),
        });
    },

    // **********Folders API**********
    createFolder: async (
        request: NGoogleDrive.CreateFolderRequest,
    ): Promise<NBaseApi.IResponse<NGoogleDrive.DriveFolderResponse | null>> => {
        const { name, parentId } = request;
        const folderMetadata: NGoogleDrive.CreateFileRequest = {
            name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: parentId ? [parentId] : undefined,
        };
        return http.post<NGoogleDrive.DriveFolderResponse>({
            endPoint: '/files',
            data: folderMetadata,
        });
    },

    listFolders: async (
        parentId?: string,
    ): Promise<NBaseApi.IResponse<NGoogleDrive.DriveFolderResponse[] | null>> => {
        const q = parentId
            ? "mimeType='application/vnd.google-apps.folder' and '" + parentId + "' in parents"
            : "mimeType='application/vnd.google-apps.folder'";
        return http.get<NGoogleDrive.DriveFolderResponse[]>({
            endPoint: `/files`,
            params: http.generateSearchParams({ q }),
        });
    },

    // **********Drives API**********
    listDrives: async (): Promise<NBaseApi.IResponse<NGoogleDrive.DriveResponse[] | null>> => {
        return http.get<NGoogleDrive.DriveResponse[]>({ endPoint: '/drives' });
    },

    getDrive: async (
        driveId: string,
    ): Promise<NBaseApi.IResponse<NGoogleDrive.DriveResponse | null>> => {
        return http.get<NGoogleDrive.DriveResponse>({ endPoint: `/drives/${driveId}` });
    },

    createDrive: async (
        request: NGoogleDrive.CreateDriveRequest,
    ): Promise<NBaseApi.IResponse<NGoogleDrive.DriveResponse | null>> => {
        const { name, requestId } = request;
        return http.post<NGoogleDrive.DriveResponse>({
            endPoint: `/drives`,
            data: { name, requestId },
            params: http.generateSearchParams({ requestId }),
        });
    },

    updateDrive: async (
        request: NGoogleDrive.UpdateDriveRequest,
    ): Promise<NBaseApi.IResponse<NGoogleDrive.DriveResponse | null>> => {
        const { driveId, updates } = request;
        return http.patch<NGoogleDrive.DriveResponse>({
            endPoint: `/drives/${driveId}`,
            data: updates,
        });
    },

    deleteDrive: async (driveId: string): Promise<NBaseApi.IResponse<null>> => {
        return http.delete<null>({ endPoint: `/drives/${driveId}` });
    },

    // **********Utility methods**********
    searchFiles: async (
        request: NGoogleDrive.SearchFileRequest,
    ): Promise<NBaseApi.IResponse<NGoogleDrive.DriveFileResponse[] | null>> => {
        const { query, options } = request;
        return http.get<NGoogleDrive.DriveFileResponse[]>({
            endPoint: `/files`,
            params: http.generateSearchParams({ q: query, ...(options as any) }),
        });
    },

    getFilesByName: async (
        name: string,
    ): Promise<NBaseApi.IResponse<NGoogleDrive.DriveFileResponse[] | null>> => {
        return driveApi.searchFiles({ query: `name='${name}'` });
    },

    getFilesByType: async (
        mimeType: string,
    ): Promise<NBaseApi.IResponse<NGoogleDrive.DriveFileResponse[] | null>> => {
        return driveApi.searchFiles({ query: `mimeType='${mimeType}'` });
    },

    getFilesInFolder: async (
        folderId: string,
    ): Promise<NBaseApi.IResponse<NGoogleDrive.DriveFileResponse[] | null>> => {
        return driveApi.searchFiles({ query: `'${folderId}' in parents` });
    },

    moveFileToFolder: async (
        request: NGoogleDrive.MoveFileToFolderRequest,
    ): Promise<NBaseApi.IResponse<NGoogleDrive.DriveFileResponse | null>> => {
        const { fileId, newParentId, oldParentId } = request;
        return http.patch<NGoogleDrive.DriveFileResponse>({
            endPoint: `/files/${fileId}`,
            data: {},
            params: http.generateSearchParams({
                addParents: newParentId,
                ...(oldParentId ? { removeParents: oldParentId } : {}),
            }),
        });
    },
};

// Danh sách file
export function useListFiles(
    request?: NGoogleDrive.ListFilesRequest,
    options?: Omit<
        UseQueryOptions<
            NBaseApi.IResponse<NGoogleDrive.ListFilesResponse | null>,
            Error,
            NBaseApi.IResponse<NGoogleDrive.ListFilesResponse | null>,
            ReturnType<typeof driveKeys.listFiles>
        >,
        'queryKey' | 'queryFn'
    >,
) {
    return useQuery<
        NBaseApi.IResponse<NGoogleDrive.ListFilesResponse | null>,
        Error,
        NBaseApi.IResponse<NGoogleDrive.ListFilesResponse | null>,
        ReturnType<typeof driveKeys.listFiles>
    >({
        queryKey: driveKeys.listFiles(request),
        queryFn: () => driveApi.listFiles(request),
        placeholderData: keepPreviousData,
        ...options,
    });
}

// Lấy chi tiết file
export function useGetFile(request?: NGoogleDrive.GetFileRequest, options?: any) {
    return useQuery({
        queryKey: driveKeys.getFile(request),
        queryFn: () => driveApi.getFile(request),
        ...options,
    });
}

// Tạo file
export function useCreateFile(options?: any) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            file,
            content,
        }: {
            file: NGoogleDrive.CreateFileRequest;
            content?: Blob | File;
        }) => driveApi.createFile(file, content),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: driveKeys.listFiles(undefined) });
        },
        ...options,
    });
}

// Cập nhật file
export function useUpdateFile(options?: any) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (request: NGoogleDrive.UpdateFileRequest) => driveApi.updateFile(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: driveKeys.listFiles(undefined) });
        },
        ...options,
    });
}

// Xóa file
export function useDeleteFile(options?: any) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (fileId: string) => driveApi.deleteFile(fileId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: driveKeys.listFiles(undefined) });
        },
        ...options,
    });
}

// Tạo folder
export function useCreateFolder(options?: any) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (request: NGoogleDrive.CreateFolderRequest) => driveApi.createFolder(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: driveKeys.listFolders(undefined) });
            queryClient.invalidateQueries({ queryKey: driveKeys.listFiles(undefined) });
        },
        ...options,
    });
}

// Danh sách folder
export function useListFolders(parentId?: string, options?: any) {
    return useQuery({
        queryKey: driveKeys.listFolders(parentId),
        queryFn: () => driveApi.listFolders(parentId),
        placeholderData: keepPreviousData,
        ...options,
    });
}

// Di chuyển file vào folder
export function useMoveFileToFolder(options?: any) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (request: NGoogleDrive.MoveFileToFolderRequest) =>
            driveApi.moveFileToFolder(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: driveKeys.listFiles(undefined) });
        },
        ...options,
    });
}

// Sao chép file
export function useCopyFile(options?: any) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (request: NGoogleDrive.CopyFileRequest) => driveApi.copyFile(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: driveKeys.listFiles(undefined) });
        },
        ...options,
    });
}

// Download file (trả về Blob)
export function useDownloadFile(fileId: string | undefined, options?: any) {
    return useQuery({
        queryKey: driveKeys.downloadFile(fileId),
        queryFn: () => (fileId ? driveApi.downloadFile(fileId) : Promise.resolve(null)),
        enabled: !!fileId,
        ...options,
    });
}

// Export file (trả về Blob)
export function useExportFile(request: NGoogleDrive.ExportFileRequest | undefined, options?: any) {
    return useQuery({
        queryKey: driveKeys.exportFile(request),
        queryFn: () => (request ? driveApi.exportFile(request) : Promise.resolve(null)),
        enabled: !!request,
        ...options,
    });
}

// Danh sách Drives
export function useListDrives(options?: any) {
    return useQuery({
        queryKey: driveKeys.listDrives(),
        queryFn: () => driveApi.listDrives(),
        ...options,
    });
}

// Lấy chi tiết Drive
export function useGetDrive(driveId: string | undefined, options?: any) {
    return useQuery({
        queryKey: driveKeys.getDrive(driveId),
        queryFn: () => (driveId ? driveApi.getDrive(driveId) : Promise.resolve(null)),
        enabled: !!driveId,
        ...options,
    });
}

// Tạo Drive
export function useCreateDrive(options?: any) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (request: NGoogleDrive.CreateDriveRequest) => driveApi.createDrive(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: driveKeys.listDrives() });
        },
        ...options,
    });
}

// Cập nhật Drive
export function useUpdateDrive(options?: any) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (request: NGoogleDrive.UpdateDriveRequest) => driveApi.updateDrive(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: driveKeys.listDrives() });
        },
        ...options,
    });
}

// Xóa Drive
export function useDeleteDrive(options?: any) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (driveId: string) => driveApi.deleteDrive(driveId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: driveKeys.listDrives() });
        },
        ...options,
    });
}

// Tìm kiếm file
export function useSearchFiles(request: NGoogleDrive.SearchFileRequest | undefined, options?: any) {
    return useQuery({
        queryKey: driveKeys.searchFiles(request),
        queryFn: () => (request ? driveApi.searchFiles(request) : Promise.resolve(null)),
        enabled: !!request,
        placeholderData: keepPreviousData,
        ...options,
    });
}

// Lấy file theo tên
export function useGetFilesByName(name: string | undefined, options?: any) {
    return useQuery({
        queryKey: driveKeys.getFilesByName(name),
        queryFn: () => (name ? driveApi.getFilesByName(name) : Promise.resolve(null)),
        enabled: !!name,
        placeholderData: keepPreviousData,
        ...options,
    });
}

// Lấy file theo loại
export function useGetFilesByType(mimeType: string | undefined, options?: any) {
    return useQuery({
        queryKey: driveKeys.getFilesByType(mimeType),
        queryFn: () => (mimeType ? driveApi.getFilesByType(mimeType) : Promise.resolve(null)),
        enabled: !!mimeType,
        placeholderData: keepPreviousData,
        ...options,
    });
}

// Lấy file trong folder
export function useGetFilesInFolder(folderId: string | undefined, options?: any) {
    return useQuery({
        queryKey: driveKeys.getFilesInFolder(folderId),
        queryFn: () => (folderId ? driveApi.getFilesInFolder(folderId) : Promise.resolve(null)),
        enabled: !!folderId,
        placeholderData: keepPreviousData,
        ...options,
    });
}
