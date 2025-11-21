import { Abstract } from '@/interfaces/common';
import { SimulationContextStatus, SimulationItemStatus, SimulationService } from '../enums';

export declare namespace NSimulation {
    interface ISimulationItem extends Abstract {
        simulationContextId: string;
        status: SimulationItemStatus;
        expiresAt?: Date;
        payload?: Record<string, any>;
        metadata?: Record<string, any>;
        errorMessage?: string;
        simulationContext: ISimulationContext;
    }

    interface ISimulationContext extends Abstract {
        name: string;
        baseUrl: string;
        status: SimulationContextStatus;
        serviceExecution: SimulationService;
        defaultPayload?: Record<string, any>;
        steps?: Record<string, any>;
        lastSuccessfulRunAt?: Date;
    }
}
