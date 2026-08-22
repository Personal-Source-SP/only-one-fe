export enum ProductMappingStatus {
    MAPPED = 'mapped',
    UNMAPPED = 'unmapped',
    MAPPED_HAS_DATA = 'mapped_has_data',
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

export enum ScraperServiceEnum {
    API = 'api',
    LOCAL = 'local',
    GENERIC = 'generic',
}

export enum LocalFolderRegistrationStatusEnum {
    CREATED = 'created',
    REUSED = 'reused',
}

export enum DataProviderFeatureType {
    SCRAPING = 'SCRAPING',
    SEARCH = 'SEARCH',
}

export enum DataProviderFeatureStatus {
    UNCONFIGURED = 'UNCONFIGURED',
    TESTING = 'TESTING',
    READY = 'READY',
    ERROR = 'ERROR',
    DISABLED = 'DISABLED',
}

export enum DataProviderFeatureErrorType {
    FATAL = 'FATAL',
    TRANSIENT = 'TRANSIENT',
}

export enum ConfigVersionType {
    ROLLBACK = 'rollback',
    MANUAL_EDIT = 'manual_edit',
    AI_GENERATED = 'ai_generated',
}
