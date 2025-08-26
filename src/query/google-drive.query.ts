import { KEY_LOCAL_STORAGE } from '@/constants';
import { NBaseApi, NGoogleDrive } from '@/interfaces';
import { GoogleDriveService } from '@/services';
import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
    UseQueryOptions,
    UseMutationOptions,
} from '@tanstack/react-query';

const driveService = new GoogleDriveService();

// Danh sách file
export function useListFiles(
    request?: NGoogleDrive.ListFilesRequest,
    options?: Omit<
        UseQueryOptions<
            NBaseApi.IResponse<NGoogleDrive.ListFilesResponse | null>,
            Error,
            NBaseApi.IResponse<NGoogleDrive.ListFilesResponse | null>,
            readonly ['googleDrive', 'listFiles', NGoogleDrive.ListFilesRequest | undefined]
        >,
        'queryKey' | 'queryFn'
    >,
) {
    return useQuery<
        NBaseApi.IResponse<NGoogleDrive.ListFilesResponse | null>,
        Error,
        NBaseApi.IResponse<NGoogleDrive.ListFilesResponse | null>,
        readonly ['googleDrive', 'listFiles', NGoogleDrive.ListFilesRequest | undefined]
    >({
        queryKey: ['googleDrive', 'listFiles', request] as const,
        queryFn: () => driveService.listFiles(request),
        placeholderData: keepPreviousData,
        ...options,
    });
}

// Lấy chi tiết file
export function useGetFile(
    request?: NGoogleDrive.GetFileRequest,
    options?: Omit<
        UseQueryOptions<
            NBaseApi.IResponse<NGoogleDrive.DriveFileResponse | null>,
            Error,
            NBaseApi.IResponse<NGoogleDrive.DriveFileResponse | null>,
            readonly ['googleDrive', 'getFile', NGoogleDrive.GetFileRequest | undefined]
        >,
        'queryKey' | 'queryFn'
    >,
) {
    return useQuery<
        NBaseApi.IResponse<NGoogleDrive.DriveFileResponse | null>,
        Error,
        NBaseApi.IResponse<NGoogleDrive.DriveFileResponse | null>,
        readonly ['googleDrive', 'getFile', NGoogleDrive.GetFileRequest | undefined]
    >({
        queryKey: ['googleDrive', 'getFile', request] as const,
        queryFn: () => driveService.getFile(request),
        ...options,
    });
}

// Tạo file
export function useCreateFile(
    options?: Omit<
        UseMutationOptions<
            NBaseApi.IResponse<NGoogleDrive.DriveFileResponse | null>,
            Error,
            { file: NGoogleDrive.CreateFileRequest; content?: Blob | File },
            unknown
        >,
        'mutationFn'
    >,
) {
    const queryClient = useQueryClient();
    return useMutation<
        NBaseApi.IResponse<NGoogleDrive.DriveFileResponse | null>,
        Error,
        { file: NGoogleDrive.CreateFileRequest; content?: Blob | File },
        unknown
    >({
        mutationFn: ({
            file,
            content,
        }: {
            file: NGoogleDrive.CreateFileRequest;
            content?: Blob | File;
        }) => driveService.createFile(file, content),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['googleDrive', 'listFiles'] });
        },
        ...options,
    });
}

// Cập nhật file
export function useUpdateFile(
    options?: Omit<
        UseMutationOptions<
            NBaseApi.IResponse<NGoogleDrive.DriveFileResponse | null>,
            Error,
            NGoogleDrive.UpdateFileRequest,
            unknown
        >,
        'mutationFn'
    >,
) {
    const queryClient = useQueryClient();
    return useMutation<
        NBaseApi.IResponse<NGoogleDrive.DriveFileResponse | null>,
        Error,
        NGoogleDrive.UpdateFileRequest,
        unknown
    >({
        mutationFn: (request: NGoogleDrive.UpdateFileRequest) => driveService.updateFile(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['googleDrive', 'listFiles'] });
        },
        ...options,
    });
}

// Xóa file
export function useDeleteFile(
    options?: Omit<
        UseMutationOptions<NBaseApi.IResponse<null>, Error, string, unknown>,
        'mutationFn'
    >,
) {
    const queryClient = useQueryClient();
    return useMutation<NBaseApi.IResponse<null>, Error, string, unknown>({
        mutationFn: (fileId: string) => driveService.deleteFile(fileId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['googleDrive', 'listFiles'] });
        },
        ...options,
    });
}

// Tạo folder
export function useCreateFolder(
    options?: Omit<
        UseMutationOptions<
            NBaseApi.IResponse<NGoogleDrive.DriveFolderResponse | null>,
            Error,
            NGoogleDrive.CreateFolderRequest,
            unknown
        >,
        'mutationFn'
    >,
) {
    const queryClient = useQueryClient();
    return useMutation<
        NBaseApi.IResponse<NGoogleDrive.DriveFolderResponse | null>,
        Error,
        NGoogleDrive.CreateFolderRequest,
        unknown
    >({
        mutationFn: (request: NGoogleDrive.CreateFolderRequest) =>
            driveService.createFolder(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['googleDrive', 'listFolders'] });
            queryClient.invalidateQueries({ queryKey: ['googleDrive', 'listFiles'] });
        },
        ...options,
    });
}

// Danh sách folder
export function useListFolders(
    parentId?: string,
    options?: Omit<
        UseQueryOptions<
            NBaseApi.IResponse<NGoogleDrive.ListDriveFolderResponse | null>,
            Error,
            NBaseApi.IResponse<NGoogleDrive.ListDriveFolderResponse | null>,
            readonly ['googleDrive', 'listFolders', string | undefined]
        >,
        'queryKey' | 'queryFn'
    >,
) {
    return useQuery<
        NBaseApi.IResponse<NGoogleDrive.ListDriveFolderResponse | null>,
        Error,
        NBaseApi.IResponse<NGoogleDrive.ListDriveFolderResponse | null>,
        readonly ['googleDrive', 'listFolders', string | undefined]
    >({
        queryKey: ['googleDrive', 'listFolders', parentId] as const,
        queryFn: () => driveService.listFolders(parentId),
        placeholderData: keepPreviousData,
        ...options,
    });
}

// Di chuyển file vào folder
export function useMoveFileToFolder(
    options?: Omit<
        UseMutationOptions<
            NBaseApi.IResponse<NGoogleDrive.DriveFileResponse | null>,
            Error,
            NGoogleDrive.MoveFileToFolderRequest,
            unknown
        >,
        'mutationFn'
    >,
) {
    const queryClient = useQueryClient();
    return useMutation<
        NBaseApi.IResponse<NGoogleDrive.DriveFileResponse | null>,
        Error,
        NGoogleDrive.MoveFileToFolderRequest,
        unknown
    >({
        mutationFn: (request: NGoogleDrive.MoveFileToFolderRequest) =>
            driveService.moveFileToFolder(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['googleDrive', 'listFiles'] });
        },
        ...options,
    });
}

// Download file (trả về Blob)
export function useDownloadFile(
    fileId: string | undefined,
    options?: Omit<
        UseQueryOptions<
            NBaseApi.IResponse<Blob | null> | null,
            Error,
            NBaseApi.IResponse<Blob | null> | null,
            readonly ['googleDrive', 'downloadFile', string | undefined]
        >,
        'queryKey' | 'queryFn'
    >,
) {
    return useQuery<
        NBaseApi.IResponse<Blob | null> | null,
        Error,
        NBaseApi.IResponse<Blob | null> | null,
        readonly ['googleDrive', 'downloadFile', string | undefined]
    >({
        queryKey: ['googleDrive', 'downloadFile', fileId] as const,
        queryFn: () => (fileId ? driveService.downloadFile(fileId) : Promise.resolve(null)),
        enabled: !!fileId,
        ...options,
    });
}

// Export file (trả về Blob)
export function useExportFile(
    request: NGoogleDrive.ExportFileRequest | undefined,
    options?: Omit<
        UseQueryOptions<
            NBaseApi.IResponse<Blob | null> | null,
            Error,
            NBaseApi.IResponse<Blob | null> | null,
            readonly ['googleDrive', 'exportFile', NGoogleDrive.ExportFileRequest | undefined]
        >,
        'queryKey' | 'queryFn'
    >,
) {
    return useQuery<
        NBaseApi.IResponse<Blob | null> | null,
        Error,
        NBaseApi.IResponse<Blob | null> | null,
        readonly ['googleDrive', 'exportFile', NGoogleDrive.ExportFileRequest | undefined]
    >({
        queryKey: ['googleDrive', 'exportFile', request] as const,
        queryFn: () => (request ? driveService.exportFile(request) : Promise.resolve(null)),
        enabled: !!request,
        ...options,
    });
}

// Tìm kiếm file
export function useSearchFiles(
    request: NGoogleDrive.SearchFileRequest | undefined,
    options?: Omit<
        UseQueryOptions<
            NBaseApi.IResponse<NGoogleDrive.DriveFileResponse[] | null> | null,
            Error,
            NBaseApi.IResponse<NGoogleDrive.DriveFileResponse[] | null> | null,
            readonly ['googleDrive', 'searchFiles', NGoogleDrive.SearchFileRequest | undefined]
        >,
        'queryKey' | 'queryFn'
    >,
) {
    return useQuery<
        NBaseApi.IResponse<NGoogleDrive.DriveFileResponse[] | null> | null,
        Error,
        NBaseApi.IResponse<NGoogleDrive.DriveFileResponse[] | null> | null,
        readonly ['googleDrive', 'searchFiles', NGoogleDrive.SearchFileRequest | undefined]
    >({
        queryKey: ['googleDrive', 'searchFiles', request] as const,
        queryFn: () => (request ? driveService.searchFiles(request) : Promise.resolve(null)),
        enabled: !!request,
        placeholderData: keepPreviousData,
        ...options,
    });
}

// Lấy file theo tên
export function useGetFilesByName(
    name: string | undefined,
    options?: Omit<
        UseQueryOptions<
            NBaseApi.IResponse<NGoogleDrive.DriveFileResponse[] | null> | null,
            Error,
            NBaseApi.IResponse<NGoogleDrive.DriveFileResponse[] | null> | null,
            readonly ['googleDrive', 'getFilesByName', string | undefined]
        >,
        'queryKey' | 'queryFn'
    >,
) {
    return useQuery<
        NBaseApi.IResponse<NGoogleDrive.DriveFileResponse[] | null> | null,
        Error,
        NBaseApi.IResponse<NGoogleDrive.DriveFileResponse[] | null> | null,
        readonly ['googleDrive', 'getFilesByName', string | undefined]
    >({
        queryKey: ['googleDrive', 'getFilesByName', name] as const,
        queryFn: () => (name ? driveService.getFilesByName(name) : Promise.resolve(null)),
        enabled: !!name,
        placeholderData: keepPreviousData,
        ...options,
    });
}

// Lấy file theo loại
export function useGetFilesByType(
    mimeType: string | undefined,
    options?: Omit<
        UseQueryOptions<
            NBaseApi.IResponse<NGoogleDrive.DriveFileResponse[] | null> | null,
            Error,
            NBaseApi.IResponse<NGoogleDrive.DriveFileResponse[] | null> | null,
            readonly ['googleDrive', 'getFilesByType', string | undefined]
        >,
        'queryKey' | 'queryFn'
    >,
) {
    return useQuery<
        NBaseApi.IResponse<NGoogleDrive.DriveFileResponse[] | null> | null,
        Error,
        NBaseApi.IResponse<NGoogleDrive.DriveFileResponse[] | null> | null,
        readonly ['googleDrive', 'getFilesByType', string | undefined]
    >({
        queryKey: ['googleDrive', 'getFilesByType', mimeType] as const,
        queryFn: () => (mimeType ? driveService.getFilesByType(mimeType) : Promise.resolve(null)),
        enabled: !!mimeType,
        placeholderData: keepPreviousData,
        ...options,
    });
}

// Lấy file trong folder
export function useGetFilesInFolder(
    folderId: string | undefined,
    options?: Omit<
        UseQueryOptions<
            NBaseApi.IResponse<NGoogleDrive.DriveFileResponse[] | null> | null,
            Error,
            NBaseApi.IResponse<NGoogleDrive.DriveFileResponse[] | null> | null,
            readonly ['googleDrive', 'getFilesInFolder', string | undefined]
        >,
        'queryKey' | 'queryFn'
    >,
) {
    return useQuery<
        NBaseApi.IResponse<NGoogleDrive.DriveFileResponse[] | null> | null,
        Error,
        NBaseApi.IResponse<NGoogleDrive.DriveFileResponse[] | null> | null,
        readonly ['googleDrive', 'getFilesInFolder', string | undefined]
    >({
        queryKey: ['googleDrive', 'getFilesInFolder', folderId] as const,
        queryFn: () => (folderId ? driveService.getFilesInFolder(folderId) : Promise.resolve(null)),
        enabled: !!folderId,
        placeholderData: keepPreviousData,
        ...options,
    });
}
