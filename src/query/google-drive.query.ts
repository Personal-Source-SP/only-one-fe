import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GoogleDriveService } from '@/services/google-drive.service';
import { NGoogleDrive, NBaseApi } from '@/interfaces';

const googleDriveService = new GoogleDriveService();

// Danh sách file
export function useListFiles(request?: NGoogleDrive.ListFilesRequest, options?: any) {
    return useQuery({
        queryKey: ['googleDrive', 'listFiles', request],
        queryFn: () => googleDriveService.listFiles(request),
        ...options,
    });
}

// Lấy chi tiết file
export function useGetFile(request?: NGoogleDrive.GetFileRequest, options?: any) {
    return useQuery({
        queryKey: ['googleDrive', 'getFile', request],
        queryFn: () => googleDriveService.getFile(request),
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
        }) => googleDriveService.createFile(file, content),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['googleDrive', 'listFiles'] });
        },
        ...options,
    });
}

// Cập nhật file
export function useUpdateFile(options?: any) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (request: NGoogleDrive.UpdateFileRequest) =>
            googleDriveService.updateFile(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['googleDrive', 'listFiles'] });
        },
        ...options,
    });
}

// Xóa file
export function useDeleteFile(options?: any) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (fileId: string) => googleDriveService.deleteFile(fileId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['googleDrive', 'listFiles'] });
        },
        ...options,
    });
}

// Tạo folder
export function useCreateFolder(options?: any) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (request: NGoogleDrive.CreateFolderRequest) =>
            googleDriveService.createFolder(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['googleDrive', 'listFolders'] });
            queryClient.invalidateQueries({ queryKey: ['googleDrive', 'listFiles'] });
        },
        ...options,
    });
}

// Danh sách folder
export function useListFolders(parentId?: string, options?: any) {
    return useQuery({
        queryKey: ['googleDrive', 'listFolders', parentId],
        queryFn: () => googleDriveService.listFolders(parentId),
        ...options,
    });
}

// Di chuyển file vào folder
export function useMoveFileToFolder(options?: any) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (request: NGoogleDrive.MoveFileToFolderRequest) =>
            googleDriveService.moveFileToFolder(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['googleDrive', 'listFiles'] });
        },
        ...options,
    });
}

// Sao chép file
export function useCopyFile(options?: any) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (request: NGoogleDrive.CopyFileRequest) => googleDriveService.copyFile(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['googleDrive', 'listFiles'] });
        },
        ...options,
    });
}

// Download file (trả về Blob)
export function useDownloadFile(fileId: string | undefined, options?: any) {
    return useQuery({
        queryKey: ['googleDrive', 'downloadFile', fileId],
        queryFn: () => (fileId ? googleDriveService.downloadFile(fileId) : Promise.resolve(null)),
        enabled: !!fileId,
        ...options,
    });
}

// Export file (trả về Blob)
export function useExportFile(request: NGoogleDrive.ExportFileRequest | undefined, options?: any) {
    return useQuery({
        queryKey: ['googleDrive', 'exportFile', request],
        queryFn: () => (request ? googleDriveService.exportFile(request) : Promise.resolve(null)),
        enabled: !!request,
        ...options,
    });
}

// Danh sách Drives
export function useListDrives(options?: any) {
    return useQuery({
        queryKey: ['googleDrive', 'listDrives'],
        queryFn: () => googleDriveService.listDrives(),
        ...options,
    });
}

// Lấy chi tiết Drive
export function useGetDrive(driveId: string | undefined, options?: any) {
    return useQuery({
        queryKey: ['googleDrive', 'getDrive', driveId],
        queryFn: () => (driveId ? googleDriveService.getDrive(driveId) : Promise.resolve(null)),
        enabled: !!driveId,
        ...options,
    });
}

// Tạo Drive
export function useCreateDrive(options?: any) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (request: NGoogleDrive.CreateDriveRequest) =>
            googleDriveService.createDrive(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['googleDrive', 'listDrives'] });
        },
        ...options,
    });
}

// Cập nhật Drive
export function useUpdateDrive(options?: any) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (request: NGoogleDrive.UpdateDriveRequest) =>
            googleDriveService.updateDrive(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['googleDrive', 'listDrives'] });
        },
        ...options,
    });
}

// Xóa Drive
export function useDeleteDrive(options?: any) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (driveId: string) => googleDriveService.deleteDrive(driveId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['googleDrive', 'listDrives'] });
        },
        ...options,
    });
}

// Tìm kiếm file
export function useSearchFiles(request: NGoogleDrive.SearchFileRequest | undefined, options?: any) {
    return useQuery({
        queryKey: ['googleDrive', 'searchFiles', request],
        queryFn: () => (request ? googleDriveService.searchFiles(request) : Promise.resolve(null)),
        enabled: !!request,
        ...options,
    });
}

// Lấy file theo tên
export function useGetFilesByName(name: string | undefined, options?: any) {
    return useQuery({
        queryKey: ['googleDrive', 'getFilesByName', name],
        queryFn: () => (name ? googleDriveService.getFilesByName(name) : Promise.resolve(null)),
        enabled: !!name,
        ...options,
    });
}

// Lấy file theo loại
export function useGetFilesByType(mimeType: string | undefined, options?: any) {
    return useQuery({
        queryKey: ['googleDrive', 'getFilesByType', mimeType],
        queryFn: () =>
            mimeType ? googleDriveService.getFilesByType(mimeType) : Promise.resolve(null),
        enabled: !!mimeType,
        ...options,
    });
}

// Lấy file trong folder
export function useGetFilesInFolder(folderId: string | undefined, options?: any) {
    return useQuery({
        queryKey: ['googleDrive', 'getFilesInFolder', folderId],
        queryFn: () =>
            folderId ? googleDriveService.getFilesInFolder(folderId) : Promise.resolve(null),
        enabled: !!folderId,
        ...options,
    });
}
