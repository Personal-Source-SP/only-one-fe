import { NGoogle } from '@/interfaces/google';

export declare namespace NUser {
    interface IUser {
        id: string;
        email: string;
        userName: string;
        isActive: boolean;
        createdAt?: Date;
        firstName?: string;
        lastName?: string;
        phoneNumber?: string;
        googleAuths: NGoogle.IGoogleAuth[];
    }
}
