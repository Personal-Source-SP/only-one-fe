import type {
    ExecutionServiceEnum,
    ScheduleJobTriggerType,
    ScheduleJobType,
    ScheduleType,
} from '../enums';
import type { IAbstract } from '@/interfaces';
import type { IScheduleJobEvent } from '@/app/(root)/schedule/job-events/types';

export interface IScheduleJob extends IAbstract {
    scheduleId: string;
    scheduleType: ScheduleType;
    executionService: ExecutionServiceEnum;
    triggerType: ScheduleJobTriggerType;
    status: ScheduleJobType;
    jobPayload: Record<string, unknown>;
    startedAt?: Date;
    finishedAt?: Date;
    errorMessage?: string;
    eventCount?: number;
    eventFailedCount?: number;
    eventSuccessCount?: number;
    eventPendingCount?: number;
    schedule?: ISchedule;
    scheduleJobEvents?: IScheduleJobEvent[];
}

export interface ISchedule extends IAbstract {
    type: ScheduleType;
    executionService: ExecutionServiceEnum;
    cronExpression: string;
    enabled: boolean;
    minScrapeIntervalMinutes: number;
    nextRunAt?: Date;
    lastRunAt?: Date;
    payload?: Record<string, unknown>;
    jobCount?: number;
    scheduleJobs: IScheduleJob[];
}

export interface IScheduleExecutionFormValues {
    name: string;
    type: string;
    cronExpression?: string;
    interval?: number;
    dataProviderId?: string;
    itemId?: string;
    isActive?: boolean;
}

export type ScheduleExecutionFormValues = IScheduleExecutionFormValues;

export type ScheduleExecutionRecord = ISchedule & {
    name?: string;
    dataProviderId?: string;
    itemId?: string;
    isActive?: boolean;
};
