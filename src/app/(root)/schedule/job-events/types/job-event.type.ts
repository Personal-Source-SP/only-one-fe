import type { IScheduleJob } from '@/app/(root)/schedule/executions/types';
import type { IAbstract } from '@/interfaces';

import type { ScheduleJobEventType } from '../enums';

export interface IScheduleJobEvent extends IAbstract {
    scheduleJobId: string;
    eventType: ScheduleJobEventType;
    eventMessage: string;
    retryCount: number;
    startedAt?: Date;
    finishedAt?: Date;
    payload?: Record<string, unknown>;
    metaData?: Record<string, unknown>;
    scheduleJob?: IScheduleJob;
}

export interface IScheduleJobEventFormValues {
    scheduleJobId: string;
    eventType: ScheduleJobEventType;
    eventMessage: string;
}

export type JobEventFormValues = IScheduleJobEventFormValues;
export type JobEventRecord = IScheduleJobEvent;
