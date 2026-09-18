import type { SimulationItemStatus } from './enums';
import type { IAbstract } from '@/interfaces';
import type { ISimulationContext } from '@/app/(root)/simulation/contexts/types';

export interface ISimulationItem extends IAbstract {
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
