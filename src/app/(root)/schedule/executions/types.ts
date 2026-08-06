import { NSchedule } from '@/interfaces';

export interface ScheduleExecutionFormValues {
    name: string;
    type: string;
    cronExpression?: string;
    interval?: number;
    dataProviderId?: string;
    itemId?: string;
    isActive?: boolean;
}

export type ScheduleExecutionRecord = NSchedule.ISchedule & {
    name?: string;
    dataProviderId?: string;
    itemId?: string;
    isActive?: boolean;
};
