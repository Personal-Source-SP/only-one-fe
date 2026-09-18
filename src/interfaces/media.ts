import { MediaType } from '@/enums';

export interface IFileItem {
    id: string;
    url: string;
    mimeType: string;
    lastModified: Date;
    folderName?: string;
    createdAt?: Date | string;
}

export interface IFileGroup {
    files: IFileItem[];
    date?: string;
    folder?: string;
}

export interface IMediaItem {
    id: string;
    url: string;
    title: string;
    type: MediaType;
    createdAt: string;
    thumbnail?: string;
}
