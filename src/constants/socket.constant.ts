export const SOCKET_MESSAGES = {
    AI_URL_VALIDATION_UPDATE: 'ai_url_validation_update',
    AI_VALIDATION_CANCELLED: 'ai_validation_cancelled',
    AI_VALIDATION_COMPLETED: 'ai_validation_completed',
    AI_VALIDATION_CREATED: 'ai_validation_created',
    AI_VALIDATION_FAILED: 'ai_validation_failed',
    AI_VALIDATION_PROGRESS: 'ai_validation_progress',
    AI_VALIDATION_STARTED: 'ai_validation_started',
    SCOUT_REQUEST_COMPLETED: 'scout_request_completed',
    SCOUT_REQUEST_PROCESSING: 'scout_request_processing',
    SCOUT_REQUEST_PROGRESS: 'scout_request_progress',
    UPDATE_PRICE_MATRIX: 'update_price_matrix',
} as const;

export type SocketMessageType = (typeof SOCKET_MESSAGES)[keyof typeof SOCKET_MESSAGES];
