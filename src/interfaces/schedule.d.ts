import {
    ExecutionServiceEnum,
    ScheduleJobEventType,
    ScheduleJobTriggerType,
    ScheduleType,
} from '@/enums';
import { Abstract } from '@/interfaces/common';

export declare namespace NSchedule {
    interface IScheduleJobEvent extends Abstract {
        scheduleJobId: string;
        eventType: ScheduleJobEventType;
        eventMessage: string;
        retryCount: number;
        startedAt?: Date;
        finishedAt?: Date;
        payload?: Record<string, any>;
        metaData?: Record<string, any>;
        scheduleJob?: IScheduleJob;
    }

    interface IScheduleJob extends Abstract {
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
        schedule?: IScheduleExecution;
        scheduleJobEvents?: IScheduleJobEvent[];
    }

    interface ISchedule extends Abstract {
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
}
