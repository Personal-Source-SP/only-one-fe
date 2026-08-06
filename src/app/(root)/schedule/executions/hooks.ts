'use client';

import { useEffect, useState } from 'react';
import { MessageType, ScheduleType } from '@/enums';
import {
    useCustomMutationData,
    useSelectDataProvider,
    useSelectItem,
    useTableContainer,
} from '@/hooks';

export const useScheduleExecutionPage = () => {
    const [loading, setLoading] = useState(false);
    const [openCreateItemModal, setOpenCreateItemModal] = useState(false);
    const [editItemId, setEditItemId] = useState<string | undefined>(undefined);

    const [type, setType] = useState<ScheduleType | undefined>(undefined);
    const [cronExpression, setCronExpression] = useState<string | undefined>(undefined);

    const [selectedScheduleId, setSelectedScheduleId] = useState<string | undefined>(undefined);

    const { handleCustomMutationData } = useCustomMutationData();

    const { options: itemOptions, query: itemQuery } = useSelectItem({ enabled: false });
    const { options: dataProviderOptions, query: dataProviderQuery } = useSelectDataProvider({
        enabled: false,
    });

    const tableContainerData = useTableContainer({
        resource: 'schedules',
    });

    useEffect(() => {
        switch (type) {
            case ScheduleType.DATA_PROVIDER:
                dataProviderQuery?.refetch();
                break;
            case ScheduleType.ITEM:
                itemQuery?.refetch();
                break;
        }
    }, [type, dataProviderQuery, itemQuery]);

    const handleSwitchStatus = (id: string, active: boolean) => {
        setLoading(true);

        handleCustomMutationData({
            values: {},
            method: 'put',
            url: `schedules/${id}/switch-status/${active}`,
            successNotification: (data) => {
                if (!data?.data?.isSuccess) {
                    setLoading(false);

                    return {
                        type: MessageType.ERROR,
                        message: 'Chuyển trạng thái thất bại',
                        description: data?.data?.message ?? 'Chuyển trạng thái thất bại',
                    };
                }

                setLoading(false);
                tableContainerData?.tableQuery?.refetch();

                return {
                    type: MessageType.SUCCESS,
                    message: 'Chuyển trạng thái thành công',
                };
            },
            errorNotification: (error) => {
                setLoading(false);

                return {
                    type: MessageType.ERROR,
                    message: 'Chuyển trạng thái thất bại',
                    description: error?.message ?? 'Chuyển trạng thái thất bại',
                };
            },
        });
    };

    const handleManualTrigger = (id: string) => {
        setLoading(true);

        handleCustomMutationData({
            values: {},
            method: 'post',
            url: `schedules/${id}/manual-trigger`,
            successNotification: (data) => {
                if (!data?.data?.isSuccess) {
                    setLoading(false);

                    return {
                        type: MessageType.ERROR,
                        message: 'Chạy thủ công thất bại',
                        description: data?.data?.message ?? 'Chạy thủ công thất bại',
                    };
                }

                setLoading(false);
                tableContainerData?.tableQuery?.refetch();

                return {
                    type: MessageType.SUCCESS,
                    message: 'Chạy thủ công thành công',
                };
            },
            errorNotification: (error) => {
                setLoading(false);

                return {
                    type: MessageType.ERROR,
                    message: 'Chạy thủ công thất bại',
                    description: error?.message ?? 'Chạy thủ công thất bại',
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
        type,
        setType,
        cronExpression,
        setCronExpression,
        selectedScheduleId,
        setSelectedScheduleId,
        itemOptions,
        dataProviderOptions,
        tableContainerData,
        handleSwitchStatus,
        handleManualTrigger,
    };
};
