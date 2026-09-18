import { NotificationType } from '@/enums';
import { IAbstract } from './common';

export interface INotification extends IAbstract {
    title: string;
    isRead: boolean;
    type: NotificationType;
    path?: string;
    userId?: string;
    description?: string;
    data?: Record<string, any>;
}
