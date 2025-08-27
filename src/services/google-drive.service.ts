import { NBaseApi, NGoogleDrive } from '@/interfaces';
import BaseApi from './base.service';

export class GoogleDriveService extends BaseApi {
    constructor() {
        super({
            baseURL: '/api/drive',
        });
    }

    // **********Files API**********
    async listFiles(
        request?: NGoogleDrive.ListFilesRequest,
    ): Promise<NBaseApi.IResponse<NGoogleDrive.ListFilesResponse | null>> {
        const params = this.generateSearchParams(request);
        const response = await this.get<NGoogleDrive.ListFilesResponse>({
            endPoint: `/files`,
            params,
        });

        return response;
    }

    async getFile(
        request?: NGoogleDrive.GetFileRequest,
    ): Promise<NBaseApi.IResponse<NGoogleDrive.DriveFileResponse | null>> {
        const response = await this.get<NGoogleDrive.DriveFileResponse>({
            endPoint: `/files/${request?.fileId}`,
            params: this.generateSearchParams(request),
        });

        return response;
    }

    async createFile(
        file: NGoogleDrive.CreateFileRequest,
        content?: Blob | File,
    ): Promise<NBaseApi.IResponse<NGoogleDrive.DriveFileResponse | null>> {
        // Use multipart upload for files with content
        if (content) {
            const formData = this.generateFormData({
                file: content,
                metadata: new Blob([JSON.stringify(file)], { type: 'application/json' }),
            });

            const response = await this.post<NGoogleDrive.DriveFileResponse>({
                endPoint: '/files',
                data: formData,
            });

            return response;
        }

        // Create metadata-only file
        const response = await this.post<NGoogleDrive.DriveFileResponse>({
            endPoint: '/files',
            data: file,
        });

        return response;
    }

    async updateFile(
        request: NGoogleDrive.UpdateFileRequest,
    ): Promise<NBaseApi.IResponse<NGoogleDrive.DriveFileResponse | null>> {
        const { fileId, updates, content } = request;

        // Use multipart upload for files with content
        if (content) {
            const formData = this.generateFormData({
                file: content,
                metadata: new Blob([JSON.stringify(updates)], { type: 'application/json' }),
            });

            const response = await this.patch<NGoogleDrive.DriveFileResponse>({
                endPoint: `/files/${fileId}`,
                data: formData,
            });

            return response;
        }

        // Update metadata only
        const response = await this.patch<NGoogleDrive.DriveFileResponse>({
            endPoint: `/files/${fileId}`,
            data: updates,
        });

        return response;
    }

    async deleteFile(fileId: string): Promise<NBaseApi.IResponse<null>> {
        const response = await this.delete<null>({
            endPoint: `/files/${fileId}`,
        });

        return response;
    }

    async downloadFile(fileId: string): Promise<NBaseApi.IResponse<Blob | null>> {
        const response = await this.get<Blob>({
            endPoint: `/files/${fileId}`,
            params: this.generateSearchParams({ alt: 'media' } as any),
        });

        return response;
    }

    async exportFile(
        request: NGoogleDrive.ExportFileRequest,
    ): Promise<NBaseApi.IResponse<Blob | null>> {
        const { fileId, mimeType } = request;

        const response = await this.get<Blob>({
            endPoint: `/files/${fileId}/export`,
            params: this.generateSearchParams({ mimeType } as any),
        });

        return response;
    }

    // **********Folders API**********
    async createFolder(
        request: NGoogleDrive.CreateFolderRequest,
    ): Promise<NBaseApi.IResponse<NGoogleDrive.DriveFolderResponse | null>> {
        const { name, parentId } = request;

        const folderMetadata: NGoogleDrive.CreateFileRequest = {
            name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: parentId ? [parentId] : undefined,
        };

        const response = await this.post<NGoogleDrive.DriveFolderResponse>({
            endPoint: '/files',
            data: folderMetadata,
        });

        return response;
    }

    async listFolders(
        parentId?: string,
    ): Promise<NBaseApi.IResponse<NGoogleDrive.ListDriveFolderResponse | null>> {
        let query = "mimeType='application/vnd.google-apps.folder'";
        if (parentId) {
            query += ` and '${parentId}' in parents`;
        }

        const response = await this.get<NGoogleDrive.ListDriveFolderResponse>({
            endPoint: `/folders`,
            params: this.generateSearchParams({ parentId } as any),
        });

        return response;
    }

    // **********Utility methods**********
    async searchFiles(
        request: NGoogleDrive.SearchFileRequest,
    ): Promise<NBaseApi.IResponse<NGoogleDrive.DriveFileResponse[] | null>> {
        const { query, options } = request;

        const response = await this.get<NGoogleDrive.DriveFileResponse[]>({
            endPoint: `/files`,
            params: this.generateSearchParams({ q: query, ...(options as any) }),
        });

        return response;
    }

    async getFilesByName(
        name: string,
    ): Promise<NBaseApi.IResponse<NGoogleDrive.DriveFileResponse[] | null>> {
        return this.searchFiles({ query: `name='${name}'` });
    }

    async getFilesByType(
        mimeType: string,
    ): Promise<NBaseApi.IResponse<NGoogleDrive.DriveFileResponse[] | null>> {
        return this.searchFiles({ query: `mimeType='${mimeType}'` });
    }

    async getFilesInFolder(
        folderId: string,
    ): Promise<NBaseApi.IResponse<NGoogleDrive.DriveFileResponse[] | null>> {
        return this.searchFiles({ query: `'${folderId}' in parents` });
    }

    async moveFileToFolder(
        request: NGoogleDrive.MoveFileToFolderRequest,
    ): Promise<NBaseApi.IResponse<NGoogleDrive.DriveFileResponse | null>> {
        const { fileId, newParentId, oldParentId } = request;

        let params = `addParents=${newParentId}`;
        if (oldParentId) {
            params += `&removeParents=${oldParentId}`;
        }

        const response = await this.patch<NGoogleDrive.DriveFileResponse>({
            endPoint: `/files/${fileId}?${params}`,
            data: {},
        });

        return response;
    }
}
