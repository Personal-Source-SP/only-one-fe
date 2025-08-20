import {
    ref,
    uploadBytes,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject,
    listAll,
    getMetadata,
    updateMetadata,
} from 'firebase/storage';
import { storage } from '@/libs/firebase';

export interface UploadProgress {
    progress: number;
    state: 'running' | 'paused' | 'success' | 'error';
    error?: string;
    downloadURL?: string;
}

export interface FileMetadata {
    name: string;
    size: number;
    updated: string;
    contentType: string;
    timeCreated: string;
    customMetadata?: Record<string, string>;
}

export class FirebaseStorageService {
    /**
     * Upload file với progress tracking
     */
    static uploadFileWithProgress(
        file: File,
        path: string,
        onProgress?: (progress: UploadProgress) => void,
        metadata?: Record<string, string>,
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            const storageRef = ref(storage, path);
            const uploadTask = uploadBytesResumable(storageRef, file, metadata);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    onProgress?.({
                        progress,
                        state: snapshot.state as any,
                    });
                },
                (error) => {
                    onProgress?.({
                        progress: 0,
                        state: 'error',
                        error: error.message,
                    });
                    reject(error);
                },
                async () => {
                    try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        onProgress?.({
                            progress: 100,
                            state: 'success',
                            downloadURL,
                        });
                        resolve(downloadURL);
                    } catch (error) {
                        reject(error);
                    }
                },
            );
        });
    }

    /**
     * Upload file đơn giản
     */
    static async uploadFile(
        file: File,
        path: string,
        metadata?: Record<string, string>,
    ): Promise<string> {
        try {
            const storageRef = ref(storage, path);
            await uploadBytes(storageRef, file, metadata);
            return await getDownloadURL(storageRef);
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }

    /**
     * Lấy download URL của file
     */
    static async getDownloadURL(path: string): Promise<string> {
        try {
            const storageRef = ref(storage, path);
            return await getDownloadURL(storageRef);
        } catch (error) {
            console.error('Error getting download URL:', error);
            throw error;
        }
    }

    /**
     * Xóa file
     */
    static async deleteFile(path: string): Promise<void> {
        try {
            const storageRef = ref(storage, path);
            await deleteObject(storageRef);
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }

    /**
     * Lấy danh sách files trong folder
     */
    static async listFiles(folderPath: string): Promise<string[]> {
        try {
            const folderRef = ref(storage, folderPath);
            const result = await listAll(folderRef);
            return result.items.map((item) => item.fullPath);
        } catch (error) {
            console.error('Error listing files:', error);
            throw error;
        }
    }

    /**
     * Lấy metadata của file
     */
    static async getFileMetadata(path: string): Promise<FileMetadata> {
        try {
            const storageRef = ref(storage, path);
            const metadata = await getMetadata(storageRef);
            return {
                name: metadata.name ?? '',
                size: metadata.size ?? 0,
                contentType: metadata.contentType ?? '',
                timeCreated: metadata.timeCreated ?? '',
                updated: metadata.updated ?? '',
                customMetadata: metadata.customMetadata,
            };
        } catch (error) {
            console.error('Error getting file metadata:', error);
            throw error;
        }
    }

    /**
     * Cập nhật metadata của file
     */
    static async updateFileMetadata(path: string, metadata: Record<string, string>): Promise<void> {
        try {
            const storageRef = ref(storage, path);
            await updateMetadata(storageRef, { customMetadata: metadata });
        } catch (error) {
            console.error('Error updating file metadata:', error);
            throw error;
        }
    }

    /**
     * Upload multiple files
     */
    static async uploadMultipleFiles(
        files: File[],
        basePath: string,
        onProgress?: (fileIndex: number, progress: UploadProgress) => void,
    ): Promise<string[]> {
        const uploadPromises = files.map((file, index) => {
            const fileName = `${Date.now()}_${index}_${file.name}`;
            const filePath = `${basePath}/${fileName}`;

            return this.uploadFileWithProgress(file, filePath, (progress) =>
                onProgress?.(index, progress),
            );
        });

        return Promise.all(uploadPromises);
    }

    /**
     * Tạo unique path cho file
     */
    static generateUniquePath(originalName: string, folder: string = 'uploads'): string {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const extension = originalName.split('.').pop();
        const fileName = `${timestamp}_${randomString}.${extension}`;
        return `${folder}/${fileName}`;
    }

    /**
     * Validate file type
     */
    static validateFileType(file: File, allowedTypes: string[]): boolean {
        return allowedTypes.includes(file.type);
    }

    /**
     * Validate file size
     */
    static validateFileSize(file: File, maxSizeInMB: number): boolean {
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
        return file.size <= maxSizeInBytes;
    }
}
