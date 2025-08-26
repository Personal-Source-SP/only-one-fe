import { SortOrder, ViewMode } from '@/enums';

export declare namespace NPhoto {
    interface Folder {
        key: string;
        label: string;
        value?: string;
    }

    interface Photo {
        id: number;
        url: string;
        date: Date;
        folder?: string;
    }

    interface Filter {
        viewMode: ViewMode;
        sortOrder: SortOrder;
        folderId?: string;
    }
}
