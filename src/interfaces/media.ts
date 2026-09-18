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
