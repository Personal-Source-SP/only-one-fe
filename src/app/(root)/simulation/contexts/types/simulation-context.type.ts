import type { IAbstract } from '@/interfaces';

import type { SimulationContextStatus, SimulationService } from '../enums';

export interface ISimulationContext extends IAbstract {
    name: string;
    baseUrl: string;
    status: SimulationContextStatus;
    serviceExecution: SimulationService;
    defaultPayload?: Record<string, unknown>;
    steps?: Record<string, unknown>;
    lastSuccessfulRunAt?: Date;
}

export interface ISimulationContextFormValues {
    name: string;
    description?: string;
    defaultPayload?: string;
    baseUrl?: string;
    serviceExecution?: SimulationService;
    status?: SimulationContextStatus;
}

export type SimulationContextFormValues = ISimulationContextFormValues;
export type SimulationContextRecord = ISimulationContext & {
    description?: string;
};
