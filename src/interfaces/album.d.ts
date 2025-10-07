export type SortOrder = 'asc' | 'desc';
export type SortField = 'name' | 'date';

export interface Photo {
    src: string;
    width: number;
    height: number;
    createdAt: number;
    title?: string;
}

export interface Folder {
    path: string;
    name: string;
    color: string;
}
