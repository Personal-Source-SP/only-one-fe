import type { IGoogleAuth } from '@/app/(root)/google/drive/photos/types';
import type { IAbstract } from '@/interfaces';

export interface IUser extends IAbstract {
    email: string;
    userName: string;
    isActive: boolean;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    googleAuths?: IGoogleAuth[];
}

export interface IUserFormValues {
    userName: string;
    email: string;
    isActive?: boolean;
}

export type UserFormValues = IUserFormValues;
export type UserRecord = IUser;
