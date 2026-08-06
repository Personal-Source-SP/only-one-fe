'use client';

import { useState } from 'react';
import { MessageType } from '@/enums';
import { useCustomMutationData, useTableContainer } from '@/hooks';

export const useSimulationContextsPage = () => {
    const [loading, setLoading] = useState(false);
    const [openCreateItemModal, setOpenCreateItemModal] = useState(false);
    const [editItemId, setEditItemId] = useState<string | undefined>(undefined);

    const { handleCustomMutationData } = useCustomMutationData();
    const tableContainerData = useTableContainer({
        resource: 'simulation-contexts',
    });

    const handleCreateSimulationItem = (id: string) => {
        setLoading(true);

        handleCustomMutationData({
            method: 'post',
            url: 'simulation-items',
            values: { simulationContextId: id },
            successNotification: (data) => {
                if (!data?.data?.isSuccess) {
                    setLoading(false);

                    return {
                        type: MessageType.ERROR,
                        message: 'Tạo mô phỏng thất bại',
                        description: data?.data?.message ?? 'Tạo mô phỏng thất bại',
                    };
                }

                setLoading(false);
                tableContainerData?.tableQuery?.refetch();

                return {
                    type: MessageType.SUCCESS,
                    message: 'Tạo mô phỏng thành công',
                };
            },
            errorNotification: (error) => {
                setLoading(false);

                return {
                    type: MessageType.ERROR,
                    message: 'Tạo mô phỏng thất bại',
                    description: error?.message ?? 'Tạo mô phỏng thất bại',
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
        tableContainerData,
        handleCreateSimulationItem,
    };
};
