import type { Abstract } from '@/interfaces';
import type {
    DiscoveryUrlStatus,
    DiscoveryValidationStatus,
    FinalValidationStatus,
    ValidationMatchResult,
    ValidationUserAction,
} from '../enums';

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
