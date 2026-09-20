import type { ISimulationContext } from '@/app/(root)/simulation/contexts/types';
import type { IAbstract } from '@/interfaces';

import type { SimulationItemStatus } from '../enums';

export interface ISimulationItem extends IAbstract {
    simulationContextId: string;
    status: SimulationItemStatus;
    expiresAt?: Date;
    payload?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    errorMessage?: string;
    simulationContext?: ISimulationContext;
}

export interface ISimulationItemFormValues {
    name: string;
    simulationContextId: string;
    payload?: string;
}

export type SimulationItemFormValues = ISimulationItemFormValues;
export type SimulationItemRecord = ISimulationItem & {
    name?: string;
};
