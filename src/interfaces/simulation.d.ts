import { Abstract } from '@/interfaces/common';

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
        identifier: string;
        name: string;
        baseUrl: string;
        status: SimulationContextStatus;
        payload?: Record<string, any>;
        lastSuccessfulScrapeAt?: Date;
        simulationItems?: ISimulationItem[];
    }
}
