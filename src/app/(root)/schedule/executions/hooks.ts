'use client';

import { useEffect, useState } from 'react';
import { API_ENDPOINT } from '@/config';
import { MessageType, ScheduleType } from '@/enums';
import {
    useCustomModalForm,
    useCustomMutationData,
    useCustomTable,
    useSelectDataProvider,
    useSelectItem,
} from '@/hooks';
import type { ScheduleExecutionFormValues, ScheduleExecutionRecord } from './types';

export const useScheduleExecutionPage = () => {
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState<ScheduleType | undefined>(undefined);
    const [cronExpression, setCronExpression] = useState<string | undefined>(undefined);
    const [selectedScheduleId, setSelectedScheduleId] = useState<string | undefined>(undefined);

    const { handleCustomMutationData } = useCustomMutationData();

    const { options: itemOptions, query: itemQuery } = useSelectItem({ enabled: false });
    const { options: dataProviderOptions, query: dataProviderQuery } = useSelectDataProvider({
        enabled: false,
    });

    const { tableProps, tableQuery, debouncedSearch, setFilters, setCurrentPage } =
        useCustomTable<ScheduleExecutionRecord>({
            resource: API_ENDPOINT.SCHEDULES.BASE,
        });

    const createModalForm = useCustomModalForm<
        ScheduleExecutionRecord,
        ScheduleExecutionFormValues,
        ScheduleExecutionRecord
    >({
        action: 'create',
        resource: API_ENDPOINT.SCHEDULES.BASE,
        onMutationSuccess: async () => {
            await tableQuery.refetch();
        },
    });

    const editModalForm = useCustomModalForm<
        ScheduleExecutionRecord,
        ScheduleExecutionFormValues,
        ScheduleExecutionRecord
    >({
        action: 'edit',
        resource: API_ENDPOINT.SCHEDULES.BASE,
        onMutationSuccess: async () => {
            await tableQuery.refetch();
        },
        initialValuesMapper: (record) => ({
            name: record.name ?? '',
            type: record.type,
            cronExpression: record.cronExpression,
            dataProviderId:
                record.dataProviderId ?? (record.payload?.dataProviderId as string | undefined),
            itemId: record.itemId ?? (record.payload?.itemId as string | undefined),
            isActive: record.enabled ?? record.isActive ?? true,
        }),
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
            url: API_ENDPOINT.SCHEDULES.SWITCH_STATUS(id, active),
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
                tableQuery?.refetch();

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
            url: API_ENDPOINT.SCHEDULES.TRIGGER(id),
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
                tableQuery?.refetch();

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
        tableProps,
        tableQuery,
        debouncedSearch,
        setFilters,
        setCurrentPage,
        createModalForm,
        editModalForm,
        type,
        setType,
        cronExpression,
        setCronExpression,
        selectedScheduleId,
        setSelectedScheduleId,
        itemOptions,
        dataProviderOptions,
        handleSwitchStatus,
        handleManualTrigger,
    };
};
