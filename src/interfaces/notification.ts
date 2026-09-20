import { NotificationType } from '@/enums';

import type { IAbstract } from './base-api';

export interface INotification extends IAbstract {
    title: string;
    isRead: boolean;
    type: NotificationType;
    path?: string;
    userId?: string;
    description?: string;
    data?: Record<string, unknown>;
}
