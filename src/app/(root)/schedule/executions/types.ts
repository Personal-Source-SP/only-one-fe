import type {
    ExecutionServiceEnum,
    ScheduleJobTriggerType,
    ScheduleJobType,
    ScheduleType,
} from './enums';
import type { Abstract } from '@/interfaces';
import type { IScheduleJobEvent } from '@/app/(root)/schedule/job-events/types';

export interface IScheduleJob extends Abstract {
    scheduleId: string;
    scheduleType: ScheduleType;
    executionService: ExecutionServiceEnum;
    triggerType: ScheduleJobTriggerType;
    status: ScheduleJobType;
    jobPayload: Record<string, any>;
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

export interface ISchedule extends Abstract {
    type: ScheduleType;
    executionService: ExecutionServiceEnum;
    cronExpression: string;
    enabled: boolean;
    minScrapeIntervalMinutes: number;
    nextRunAt?: Date;
    lastRunAt?: Date;
    payload?: Record<string, any>;
    jobCount?: number;
    scheduleJobs: IScheduleJob[];
}

export interface ScheduleExecutionFormValues {
    name: string;
    type: string;
    cronExpression?: string;
    interval?: number;
    dataProviderId?: string;
    itemId?: string;
    isActive?: boolean;
}

export type ScheduleExecutionRecord = ISchedule & {
    name?: string;
    dataProviderId?: string;
    itemId?: string;
    isActive?: boolean;
};
