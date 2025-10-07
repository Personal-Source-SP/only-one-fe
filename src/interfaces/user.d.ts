import { NGoogle } from '@/interfaces/google';

export declare namespace NUser {
    interface IUser {
        id: string;
        email: string;
        isActive: boolean;
        firstName?: string;
        lastName?: string;
        phoneNumber?: string;
        googleAuth: NGoogle.IGoogleAuth;
    }
}
