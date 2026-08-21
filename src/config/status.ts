export const ACTIVE_STATUS_COLORS = {
    active: 'green',
    inactive: 'red',
    true: 'green',
    false: 'red',
} as const;

export const BOOLEAN_TAG_COLORS = {
    no: 'default',
    yes: 'blue',
    false: 'default',
    true: 'blue',
} as const;

export const SCHEDULE_JOB_STATUS_COLORS = {
    pending: 'default',
    processing: 'processing',
    completed: 'success',
    failed: 'error',
} as const;
