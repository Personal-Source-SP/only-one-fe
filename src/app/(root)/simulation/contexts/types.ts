import { NSimulation } from '@/interfaces';

export interface SimulationContextFormValues {
    name: string;
    description?: string;
    defaultPayload?: string;
}

export type SimulationContextRecord = NSimulation.ISimulationContext & {
    description?: string;
};
