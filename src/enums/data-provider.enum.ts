export enum ProductMappingStatus {
    MAPPED = 'mapped',
    UNMAPPED = 'unmapped',
    MAPPED_HAS_PRICE = 'mapped_has_price',
}

export enum DataProviderStatus {
    READY = 'ready',
    TESTING = 'testing',
    UNCONFIGURED = 'unconfigured',
    ERROR = 'error',
}

export enum DataProviderSearchStatus {
    READY = 'ready',
    TESTING = 'testing',
    UNCONFIGURED = 'unconfigured',
    ERROR = 'error',
}

export enum ScrapeStatusEnum {
    ERROR = 'error',
    PENDING = 'pending',
    SUCCESS = 'success',
    PROCESSING = 'processing',
}

export enum ScraperServiceEnum {
    GENERIC = 'generic',
}

export enum ConfigVersionType {
    ROLLBACK = 'rollback',
    MANUAL_EDIT = 'manual_edit',
    AI_GENERATED = 'ai_generated',
}
