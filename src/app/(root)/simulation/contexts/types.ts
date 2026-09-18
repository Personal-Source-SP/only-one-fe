import type { SimulationContextStatus, SimulationService } from './enums';
import type { IAbstract } from '@/interfaces';

export interface ISimulationContext extends IAbstract {
    name: string;
    baseUrl: string;
    status: SimulationContextStatus;
    serviceExecution: SimulationService;
    defaultPayload?: Record<string, unknown>;
    steps?: Record<string, unknown>;
    lastSuccessfulRunAt?: Date;
}

export interface SimulationContextFormValues {
    name: string;
    description?: string;
    defaultPayload?: string;
}

export type SimulationContextRecord = ISimulationContext & {
    description?: string;
};
