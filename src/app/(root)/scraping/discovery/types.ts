import type { IDataProvider } from '@/app/(root)/scraping/data-providers/types';
import type { Abstract } from '@/interfaces';

export enum DiscoverySessionStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    FAILED = 'failed',
}

export enum DiscoveryUrlStatus {
    DISCOVERED = 'discovered',
    QUEUED = 'queued',
    SCRAPED = 'scraped',
    FAILED = 'failed',
}

export interface IDiscoverySession extends Abstract {
    sessionCode: string;
    dataProviderId: string;
    dataProvider?: IDataProvider;
    targetUrl: string;
    status: DiscoverySessionStatus;
    totalDiscovered: number;
    totalQueued: number;
    depth: number;
    durationSeconds?: number;
    errorMessage?: string;
}

export interface IDiscoveryUrl extends Abstract {
    sessionId: string;
    sessionCode?: string;
    dataProviderId: string;
    dataProviderName?: string;
    url: string;
    title?: string;
    status: DiscoveryUrlStatus;
    foundAtDepth: number;
}

export interface CreateSessionFormValues {
    dataProviderId: string;
    targetUrl: string;
    depth?: number;
    maxUrls?: number;
    notes?: string;
}
