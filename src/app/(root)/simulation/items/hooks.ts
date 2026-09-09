'use client';

import { useState } from 'react';
import { API_ENDPOINT } from '@/config';
import { MessageType } from '@/enums';
import { SimulationItemStatus } from './enums';
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

    const { tableProps, tableQuery, debouncedSearch, setFilters, setCurrentPage } =
        useCustomTable<SimulationItemRecord>({
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
            await tableQuery.refetch();
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
            await tableQuery.refetch();
        },
        initialValuesMapper: (record) => ({
            name: record.name,
            simulationContextId: record.simulationContextId,
            payload:
                typeof record.payload === 'object'
                    ? JSON.stringify(record.payload, null, 2)
                    : record.payload,
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

    const handleSimulationItemAction = (id: string, status: SimulationItemStatus) => {
        setLoading(true);

        handleCustomMutationData({
            values: { status },
            method: 'put',
            url: API_ENDPOINT.SIMULATION.ACTION(id),
            successNotification: (data) => {
                if (!data?.data?.isSuccess) {
                    setLoading(false);

                    return {
                        type: MessageType.ERROR,
                        message: 'Thao tác thất bại',
                        description: data?.data?.message ?? 'Thao tác thất bại',
                    };
                }

                setLoading(false);
                tableQuery?.refetch();

                return {
                    type: MessageType.SUCCESS,
                    message: 'Thao tác thành công',
                };
            },
            errorNotification: (error) => {
                setLoading(false);

                return {
                    type: MessageType.ERROR,
                    message: 'Thao tác thất bại',
                    description: error?.message ?? 'Thao tác thất bại',
                };
            },
        });
    };

    return {
        loading,
        tableProps,
        tableQuery,
        debouncedSearch,
        setFilters,
        setCurrentPage,
        createModalForm,
        editModalForm,
        simulationContextOptions,
        simulationContextQuery,
        handleSimulationItemAction,
    };
};
