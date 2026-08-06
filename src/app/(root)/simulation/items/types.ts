import { NSimulation } from '@/interfaces';

export interface SimulationItemFormValues {
    name: string;
    simulationContextId: string;
    payload?: string;
}

export type SimulationItemRecord = NSimulation.ISimulationItem & {
    name?: string;
};
