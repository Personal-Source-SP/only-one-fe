'use client';

import { useState } from 'react';
import { API_ENDPOINT } from '@/config';
import { MessageType } from '@/enums';
import {
    useCustomModalForm,
    useCustomMutationData,
    useCustomTable,
    useSelectSimulationContext,
} from '@/hooks';
import type { SimulationItemFormValues, SimulationItemRecord } from './types';

export const useSimulationItemsPage = () => {
    const [loading, setLoading] = useState(false);

    const { options: simulationContextOptions, query: simulationContextQuery } =
        useSelectSimulationContext();
    const { handleCustomMutationData } = useCustomMutationData();

    const table = useCustomTable<SimulationItemRecord>({
        resource: API_ENDPOINT.SIMULATION.ITEMS,
    });

    const createModalForm = useCustomModalForm<
        SimulationItemRecord,
        SimulationItemFormValues,
        SimulationItemRecord
    >({
        action: 'create',
        resource: API_ENDPOINT.SIMULATION.ITEMS,
        onMutationSuccess: async () => {
            await table.tableQuery.refetch();
        },
        onFinish: (values) => {
            try {
                return {
                    ...values,
                    payload: values.payload ? JSON.parse(values.payload) : undefined,
                };
            } catch {
                return values;
            }
        },
    });

    const editModalForm = useCustomModalForm<
        SimulationItemRecord,
        SimulationItemFormValues,
        SimulationItemRecord
    >({
        action: 'edit',
        resource: API_ENDPOINT.SIMULATION.ITEMS,
        onMutationSuccess: async () => {
            await table.tableQuery.refetch();
        },
        initialValuesMapper: (record) => ({
            name: record.name ?? '',
            simulationContextId: record.simulationContextId,
            expiresAt: record.expiresAt,
            payload: record.payload ? JSON.stringify(record.payload, null, 2) : undefined,
        }),
        onFinish: (values) => {
            try {
                return {
                    ...values,
                    payload: values.payload ? JSON.parse(values.payload) : undefined,
                };
            } catch {
                return values;
            }
        },
    });

    const handleSimulationItemAction = async (
        id: string,
        action: 'start' | 'stop' | 'toggle-status',
        _item?: SimulationItemRecord,
    ) => {
        setLoading(true);
        try {
            await handleCustomMutationData({
                url: API_ENDPOINT.SIMULATION.ACTION(id),
                method: 'post',
                values: { action },
                onSuccess: async () => {
                    await table.tableQuery.refetch();
                },
                successNotification: () => ({
                    type: MessageType.SUCCESS,
                    message: 'Thao tác thành công',
                }),
                errorNotification: (error) => ({
                    type: MessageType.ERROR,
                    message: 'Thao tác thất bại',
                    description: error?.message ?? 'Thao tác thất bại',
                }),
            });
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        table,
        debouncedSearch: table.debouncedSearch,
        setFilters: table.setFilters,
        setCurrentPage: table.setCurrentPage,
        createModalForm,
        editModalForm,
        simulationContextOptions,
        simulationContextQuery,
        handleSimulationItemAction,
    };
};
