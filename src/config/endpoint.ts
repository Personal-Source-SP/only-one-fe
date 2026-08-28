const API_VERSION = '';

const prefix = (path: string) => (API_VERSION ? `${API_VERSION}/${path}` : path);

export const API_ENDPOINT = {
    AUTH: {
        LOGIN: prefix('auth/login'),
        REGISTER: prefix('auth/register'),
        REFRESH: prefix('auth/refresh-token'),
        ME: prefix('auth/me'),
        FORGET_PASSWORD: prefix('auth/forget-password'),
    },
    DATA_PROVIDERS: {
        BASE: prefix('data-providers'),
        ALL: prefix('data-providers/all'),
        DETAIL: (id: string | number) => prefix(`data-providers/${id}`),
    },
    DATA_PROVIDER_FEATURES: {
        BASE: prefix('data-provider-features'),
        ALL: prefix('data-provider-features/all'),
        BY_PROVIDER: (providerId: string | number) =>
            prefix(`data-provider-features/data-providers/${providerId}`),
        DETAIL: (id: string | number) => prefix(`data-provider-features/${id}`),
        TEST: prefix('data-provider-features/test'),
        VERSIONS: (id: string | number) => prefix(`data-provider-features/${id}/versions`),
        ROLLBACK: (id: string | number, versionId: string | number) =>
            prefix(`data-provider-features/${id}/versions/${versionId}/rollback`),
    },
    DATA_PROVIDER_ITEMS: {
        BASE: prefix('data-provider-items'),
        ALL: prefix('data-provider-items/all'),
        DETAIL: (id: string | number) => prefix(`data-provider-items/${id}`),
    },
    ITEMS: {
        BASE: prefix('items'),
        ALL: prefix('items/all'),
        DETAIL: (id: string | number) => prefix(`items/${id}`),
        IMPORT: prefix('items/import'),
    },
    SCRAPING_DATA: {
        BASE: prefix('scraping-data'),
        ALL: prefix('scraping-data/all'),
        DETAIL: (id: string | number) => prefix(`scraping-data/${id}`),
        PROCESS: prefix('scraping-data/process'),
    },
    DISCOVERY_SESSIONS: {
        BASE: prefix('discovery-sessions'),
        ALL: prefix('discovery-sessions/all'),
        DETAIL: (id: string | number) => prefix(`discovery-sessions/${id}`),
        SUMMARY: (id: string | number) => prefix(`discovery-sessions/${id}/summary`),
        VALIDATE: (id: string | number) => prefix(`discovery-sessions/${id}/validate`),
        LATEST_BATCH: (id: string | number) =>
            prefix(`discovery-sessions/${id}/validation-latest-batch`),
        BULK_USER_ACTIONS: (id: string | number) =>
            prefix(`discovery-sessions/${id}/bulk-user-actions`),
        ENQUEUE_URLS: (id: string | number) => prefix(`discovery-sessions/${id}/enqueue-urls`),
    },
    DISCOVERY_URLS: {
        BASE: prefix('discovery-urls'),
        ALL: prefix('discovery-urls/all'),
        DETAIL: (id: string | number) => prefix(`discovery-urls/${id}`),
        USER_ACTION: (id: string | number) => prefix(`discovery-urls/${id}/user-action`),
        REVALIDATE: (id: string | number) => prefix(`discovery-urls/${id}/re-validate`),
        LOGS: (id: string | number) => prefix(`discovery-urls/${id}/validation-logs`),
    },
    SCHEDULES: {
        BASE: prefix('schedules'),
        ALL: prefix('schedules/all'),
        DETAIL: (id: string | number) => prefix(`schedules/${id}`),
        TRIGGER: (id: string | number) => prefix(`schedules/${id}/manual-trigger`),
        SWITCH_STATUS: (id: string | number, active: boolean | string) =>
            prefix(`schedules/${id}/switch-status/${active}`),
        JOBS: (scheduleId: string | number) => prefix(`schedule-jobs/schedule/${scheduleId}`),
    },
    SCHEDULE_JOBS: {
        BASE: prefix('schedule-jobs'),
        ALL: prefix('schedule-jobs/all'),
        DETAIL: (id: string | number) => prefix(`schedule-jobs/${id}`),
    },
    SCHEDULE_JOB_EVENTS: {
        BASE: prefix('schedule-job-events'),
        ALL: prefix('schedule-job-events/all'),
        DETAIL: (id: string | number) => prefix(`schedule-job-events/${id}`),
    },
    GOOGLE_DRIVE: {
        FOLDERS: prefix('google-folder'),
        FOLDERS_ALL: prefix('google-folder/all'),
        FILES: prefix('google-file'),
        FILES_ALL: prefix('google-file/all'),
        SYNC: prefix('google/sync'),
        EXCHANGE_TOKEN: prefix('google/exchange-token'),
    },
    CLOUD_DATA_PROVIDERS: {
        BASE: prefix('cloud-data-providers'),
        ALL: prefix('cloud-data-providers/all'),
        DETAIL: (id: string | number) => prefix(`cloud-data-providers/${id}`),
    },
    SIMULATION: {
        CONTEXTS: prefix('simulation-contexts'),
        CONTEXTS_ALL: prefix('simulation-contexts/all'),
        ITEMS: prefix('simulation-items'),
        ITEMS_ALL: prefix('simulation-items/all'),
        ACTION: (id: string | number) => prefix(`simulation-items/${id}/action`),
    },
    USERS: {
        BASE: prefix('users'),
        ALL: prefix('users/all'),
        DETAIL: (id: string | number) => prefix(`users/${id}`),
    },
    NOTIFICATIONS: {
        BASE: prefix('notifications'),
        READ: (id: string | number) => prefix(`notifications/read/${id}`),
        MARK_ALL_READ: prefix('notifications/mark-all-read'),
    },
    SETTINGS: {
        BASE: prefix('settings'),
    },
} as const;
