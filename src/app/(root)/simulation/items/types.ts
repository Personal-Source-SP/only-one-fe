import type { SimulationItemStatus } from '@/enums';
import type { Abstract } from '@/interfaces';
import type { ISimulationContext } from '@/app/(root)/simulation/contexts/types';

export interface ISimulationItem extends Abstract {
    simulationContextId: string;
    status: SimulationItemStatus;
    expiresAt?: Date;
    payload?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    errorMessage?: string;
    simulationContext: ISimulationContext;
}

export interface SimulationItemFormValues {
    name: string;
    simulationContextId: string;
    payload?: string;
}

export type SimulationItemRecord = ISimulationItem & {
    name?: string;
};
