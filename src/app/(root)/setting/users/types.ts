import { NUser } from '@/interfaces';

export interface UserFormValues {
    userName: string;
    email: string;
    isActive?: boolean;
}

export type UserRecord = NUser.IUser;
