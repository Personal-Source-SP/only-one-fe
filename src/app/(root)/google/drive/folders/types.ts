import type { useCustomModal } from '@/hooks';
import type { IDataOption } from '@/interfaces';

export interface IGoogleDriveFolder {
    id: string;
    name: string;
    googleAuthId: string;
    googleDriveId: string;
    parentFolderId?: string;
    lastModified?: Date;
    isTrashed?: boolean;
    isStarred?: boolean;
}

export type GoogleFolderRecord = IGoogleDriveFolder;

export type FolderModalProps = {
    folderOptions: IDataOption[];
    modalPropsData: ReturnType<typeof useCustomModal>;
    onSubmit: () => void;
    onClose?: () => void;
};
