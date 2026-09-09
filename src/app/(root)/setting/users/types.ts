import type { IGoogleAuth } from '@/app/(root)/google/drive/photos/types';

export interface IUser {
    id: string;
    email: string;
    userName: string;
    isActive: boolean;
    createdAt?: Date;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    googleAuths?: IGoogleAuth[];
}

export interface UserFormValues {
    userName: string;
    email: string;
    isActive?: boolean;
}

export type UserRecord = IUser;
