import { SimulationContextStatus, SimulationItemStatus, SimulationService } from '@/enums';
import { Abstract } from '@/interfaces';

export declare namespace NSimulation {
    interface ISimulationItem extends Abstract {
        simulationContextId: string;
        status: SimulationItemStatus;
        expiresAt?: Date;
        payload?: Record<string, unknown>;
        metadata?: Record<string, unknown>;
        errorMessage?: string;
        simulationContext: ISimulationContext;
    }

    interface ISimulationContext extends Abstract {
        name: string;
        baseUrl: string;
        status: SimulationContextStatus;
        serviceExecution: SimulationService;
        defaultPayload?: Record<string, unknown>;
        steps?: Record<string, unknown>;
        lastSuccessfulRunAt?: Date;
    }
}
