import type { DataProviderFormValues } from './types';

export const DATA_PROVIDER_INITIAL_VALUES: DataProviderFormValues = {
    name: '',
    baseUrl: '',
    identifier: '',
};

export const DATA_PROVIDER_LIMITS = {
    NAME_MAX_LENGTH: 255,
    IDENTIFIER_MAX_LENGTH: 20,
} as const;

export const DATA_PROVIDER_COLUMNS_WIDTH = {
    NAME: '25%',
    IDENTIFIER: '15%',
    BASE_URL: '30%',
    CREATED_AT: '15%',
} as const;
