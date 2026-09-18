import type { ScheduleJobEventType } from './enums';
import type { IAbstract } from '@/interfaces';
import type { IScheduleJob } from '@/app/(root)/schedule/executions/types';

export interface IScheduleJobEvent extends IAbstract {
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

export type JobEventRecord = IScheduleJobEvent;
