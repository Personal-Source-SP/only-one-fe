import type { UseCustomModalFormResponse } from '@/hooks';
import type { IOption } from '@/interfaces';
import { FieldsEnum } from './constants';

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

export type FolderFormValues = {
    [FieldsEnum.Name]: string;
    [FieldsEnum.ParentFolderId]?: string;
};

export type FolderModalProps = {
    folderOptions: IOption[];
    modalForm: UseCustomModalFormResponse<GoogleFolderRecord, FolderFormValues, GoogleFolderRecord>;
};
