'use client';

import { useState } from 'react';
import { API_ENDPOINT } from '@/config';
import { MessageType } from '@/enums';
import { useCustomModalForm, useCustomMutationData, useCustomTable } from '@/hooks';
import type { SimulationContextFormValues, SimulationContextRecord } from './types';

export const useSimulationContextsPage = () => {
    const [loading, setLoading] = useState(false);
    const { handleCustomMutationData } = useCustomMutationData();

    const table = useCustomTable<SimulationContextRecord>({
        resource: API_ENDPOINT.SIMULATION.CONTEXTS,
    });

    const createModalForm = useCustomModalForm<
        SimulationContextRecord,
        SimulationContextFormValues,
        SimulationContextRecord
    >({
        action: 'create',
        resource: API_ENDPOINT.SIMULATION.CONTEXTS,
        onMutationSuccess: async () => {
            await table.tableQuery.refetch();
        },
        onFinish: (values) => {
            try {
                return {
                    ...values,
                    defaultPayload: values.defaultPayload
                        ? JSON.parse(values.defaultPayload)
                        : undefined,
                };
            } catch {
                return values;
            }
        },
    });

    const editModalForm = useCustomModalForm<
        SimulationContextRecord,
        SimulationContextFormValues,
        SimulationContextRecord
    >({
        action: 'edit',
        resource: API_ENDPOINT.SIMULATION.CONTEXTS,
        onMutationSuccess: async () => {
            await table.tableQuery.refetch();
        },
        initialValuesMapper: (record) => ({
            name: record.name,
            description: record.description,
            defaultPayload:
                typeof record.defaultPayload === 'object'
                    ? JSON.stringify(record.defaultPayload, null, 2)
                    : record.defaultPayload,
        }),
        onFinish: (values) => {
            try {
                return {
                    ...values,
                    defaultPayload: values.defaultPayload
                        ? JSON.parse(values.defaultPayload)
                        : undefined,
                };
            } catch {
                return values;
            }
        },
    });

    const handleCreateSimulationItem = (contextId: string, expiresAt?: Date) => {
        setLoading(true);

        handleCustomMutationData({
            values: { contextId, expiresAt },
            method: 'post',
            url: API_ENDPOINT.SIMULATION.ITEMS,
            successNotification: (data) => {
                if (!data?.data?.isSuccess) {
                    setLoading(false);

                    return {
                        type: MessageType.ERROR,
                        message: 'Tạo đối tượng mô phỏng thất bại',
                        description: data?.data?.message ?? 'Tạo đối tượng mô phỏng thất bại',
                    };
                }

                setLoading(false);
                table.tableQuery?.refetch();

                return {
                    type: MessageType.SUCCESS,
                    message: 'Tạo đối tượng mô phỏng thành công',
                };
            },
            errorNotification: (error) => {
                setLoading(false);

                return {
                    type: MessageType.ERROR,
                    message: 'Tạo đối tượng mô phỏng thất bại',
                    description: error?.message ?? 'Tạo đối tượng mô phỏng thất bại',
                };
            },
        });
    };

    return {
        loading,
        table,
        debouncedSearch: table.debouncedSearch,
        setFilters: table.setFilters,
        setCurrentPage: table.setCurrentPage,
        createModalForm,
        editModalForm,
        handleCreateSimulationItem,
    };
};
