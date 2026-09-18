import type { IDataProvider } from '@/app/(root)/scraping/data-providers/types/data-provider.type';
import type { IAbstract } from '@/interfaces';
import type { DiscoverySessionStatus, ValidationBatchStatus } from '../enums';

export interface IDiscoverySession extends IAbstract {
    sessionCode: string;
    dataProviderId: string;
    targetUrl: string;
    targetKeywords?: string[];
    status: DiscoverySessionStatus;
    depth: number;
    maxUrls?: number;
    autoValidate: boolean;
    totalDiscovered: number;
    totalQueued: number;
    totalValidated: number;
    validationStatus: ValidationBatchStatus;
    matchedUrls: number;
    noMatchUrls: number;
    validationStartedAt?: Date;
    validationCompletedAt?: Date;
    validationReasonCancelled?: string;
    durationSeconds?: number;
    errorMessage?: string;

    // Relations
    dataProvider?: IDataProvider;
}

export interface CreateSessionFormValues {
    dataProviderId: string;
    targetKeywords?: string[];
    depth?: number;
    maxUrls?: number;
    autoValidate?: boolean;
}

export interface ISessionSummaryResponse {
    session: IDiscoverySession;
    exactMatches: number;
    partialMatches: number;
    noMatches: number;
    totalDiscovered: number;
    totalQueued: number;
}
