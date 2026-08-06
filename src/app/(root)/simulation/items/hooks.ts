'use client';

import { useState } from 'react';
import { MessageType, SimulationItemStatus } from '@/enums';
import { useCustomMutationData, useSelectSimulationContext, useTableContainer } from '@/hooks';

export const useSimulationItemsPage = () => {
    const [loading, setLoading] = useState(false);
    const [openCreateItemModal, setOpenCreateItemModal] = useState(false);
    const [editItemId, setEditItemId] = useState<string | undefined>(undefined);

    const { handleCustomMutationData } = useCustomMutationData();
    const { options: simulationContextOptions, query: simulationContextQuery } =
        useSelectSimulationContext();

    const tableContainerData = useTableContainer({
        resource: 'simulation-items',
    });

    const handleSimulationItemAction = (id: string, status: SimulationItemStatus) => {
        if (!id) return;

        const actionMessages: Record<string, { success: string; failed: string }> = {
            [SimulationItemStatus.PROCESSING]: {
                success: 'Bắt đầu mô phỏng thành công',
                failed: 'Bắt đầu mô phỏng thất bại',
            },
        };

        const action: Record<string, string> = {
            [SimulationItemStatus.PROCESSING]: 'run',
        };

        setLoading(true);

        handleCustomMutationData({
            values: {},
            method: 'post',
            url: `simulation-items/${id}/${action[status]}`,
            successNotification: (data) => {
                if (!data?.data?.isSuccess) {
                    setLoading(false);

                    return {
                        type: MessageType.ERROR,
                        message: actionMessages[status]?.failed,
                        description: data?.data?.message ?? actionMessages[status]?.failed,
                    };
                }

                setLoading(false);
                tableContainerData?.tableQuery?.refetch();

                return {
                    type: MessageType.SUCCESS,
                    message: actionMessages[status].success,
                };
            },
            errorNotification: (error) => {
                setLoading(false);

                return {
                    type: MessageType.ERROR,
                    message: actionMessages[status].failed,
                    description: error?.message ?? actionMessages[status].failed,
                };
            },
        });
    };

    return {
        loading,
        openCreateItemModal,
        setOpenCreateItemModal,
        editItemId,
        setEditItemId,
        simulationContextOptions,
        simulationContextQuery,
        tableContainerData,
        handleSimulationItemAction,
    };
};
