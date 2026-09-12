import type { IDataProvider } from '@/app/(root)/scraping/data-providers/types';
import type { Abstract } from '@/interfaces';
import type { DiscoverySessionStatus } from '../enums';

export interface IDiscoverySession extends Abstract {
    sessionCode: string;
    dataProviderId: string;
    dataProvider?: IDataProvider;
    targetUrl: string;
    targetKeywords?: string[];
    status: DiscoverySessionStatus;
    totalDiscovered: number;
    totalValidated: number;
    totalQueued: number;
    depth: number;
    maxUrls: number;
    durationSeconds?: number;
    errorMessage?: string;
}

export interface CreateSessionFormValues {
    dataProviderId: string;
    targetKeywords?: string[];
    depth?: number;
    maxUrls?: number;
}

export interface ISessionSummaryResponse {
    session: IDiscoverySession;
    exactMatches: number;
    partialMatches: number;
    noMatches: number;
    totalDiscovered: number;
    totalQueued: number;
}
