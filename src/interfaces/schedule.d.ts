import { ScheduleJobEventType, ScheduleJobTriggerType, ScheduleType } from '@/enums';
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
        triggerType: ScheduleJobTriggerType;
        status: ScheduleJobType;
        jobPayload: Record<string, any>;
        startedAt?: Date;
        finishedAt?: Date;
        errorMessage?: string;
        schedule?: IScheduleExecution;
        scheduleJobEvents?: IScheduleJobEvent[];
    }

    interface ISchedule extends Abstract {
        type: ScheduleType;
        cronExpression: string;
        enabled: boolean;
        minScrapeIntervalMinutes: number;
        nextRunAt?: Date;
        lastRunAt?: Date;
        payload?: Record<string, any>;
        scheduleJobs: IScheduleJob[];
    }
}
