export enum ScheduleType {
    GLOBAL = 'global',
    ITEM = 'item',
    DATA_PROVIDER = 'data_provider',
}

export enum ScheduleJobTriggerType {
    CRON = 'cron',
    MANUAL = 'manual',
}

export enum ScheduleJobType {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
}

export enum ScheduleJobEventType {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
}
