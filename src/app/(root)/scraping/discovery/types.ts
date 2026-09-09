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

export enum DiscoveryValidationStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
    SKIPPED = 'skipped',
}

export enum ValidationMatchResult {
    EXACT_MATCH = 'exact_match',
    PARTIAL_MATCH = 'partial_match',
    NO_MATCH = 'no_match',
}

export enum ValidationUserAction {
    CONFIRM = 'confirm',
    REJECT = 'reject',
    EXCLUDE = 'exclude',
}

export enum FinalValidationStatus {
    PENDING_REVIEW = 'pending_review',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

export interface IDiscoverySession extends Abstract {
    sessionCode: string;
    dataProviderId: string;
    dataProvider?: IDataProvider;
    targetUrl: string;
    status: DiscoverySessionStatus;
    totalDiscovered: number;
    totalValidated: number;
    totalQueued: number;
    depth: number;
    maxUrls: number;
    notes?: string;
    durationSeconds?: number;
    errorMessage?: string;
}

export interface IDiscoveryUrl extends Abstract {
    sessionId: string;
    sessionCode?: string;
    dataProviderId: string;
    dataProviderName?: string;
    url: string;
    domain?: string;
    title?: string;
    status: DiscoveryUrlStatus;
    validationStatus: DiscoveryValidationStatus;
    matchResult?: ValidationMatchResult;
    confidenceScore?: number;
    priceDetected: boolean;
    detectedPrice?: number;
    detectedCurrency?: string;
    userAction?: ValidationUserAction;
    userActionDate?: Date;
    userActionReason?: string;
    finalValidationStatus: FinalValidationStatus;
    foundAtDepth: number;
}

export interface CreateSessionFormValues {
    dataProviderId: string;
    targetUrl: string;
    depth?: number;
    maxUrls?: number;
    notes?: string;
    targetKeyword?: string;
}

export interface ISessionSummaryResponse {
    session: IDiscoverySession;
    exactMatches: number;
    partialMatches: number;
    noMatches: number;
    totalDiscovered: number;
    totalQueued: number;
}
