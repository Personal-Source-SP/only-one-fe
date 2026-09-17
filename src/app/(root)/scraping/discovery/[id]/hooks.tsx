'use client';

import {
    DiscoveryUrlStatus,
    type IDiscoverySession,
    type IDiscoveryUrl,
} from '@/app/(root)/scraping/discovery/types';
import { API_ENDPOINT } from '@/config';
import { useCustomMutationData, useCustomOne, useCustomTable } from '@/hooks';
import { useMemo, useState } from 'react';

export const useDiscoveryDetailPage = (id: string) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

    const { handleCustomMutationData, mutation } = useCustomMutationData();

    const {
        data: session,
        query: { isLoading: isSessionLoading, refetch: refetchSession },
    } = useCustomOne<IDiscoverySession>({
        id,
        queryOptions: { enabled: Boolean(id) },
        resource: API_ENDPOINT.DISCOVERY_SESSIONS.BASE,
    });

    const { tableProps, tableQuery, debouncedSearch } = useCustomTable<IDiscoveryUrl>({
        resource: API_ENDPOINT.DISCOVERY_URLS.BASE,
        filters: {
            permanent: [
                {
                    value: id,
                    operator: 'eq',
                    field: 'sessionId',
                },
            ],
        },
        queryOptions: {
            enabled: Boolean(id),
        },
    });

    const urls = useMemo(
        () => (tableProps.dataSource ?? []) as unknown as IDiscoveryUrl[],
        [tableProps.dataSource],
    );

    const queuedCount = useMemo(
        () => urls.filter((u) => u.status === DiscoveryUrlStatus.QUEUED).length,
        [urls],
    );

    const handleBatchEnqueue = async () => {
        if (selectedRowKeys.length === 0) return;
        await handleCustomMutationData({
            url: API_ENDPOINT.DISCOVERY_SESSIONS.ENQUEUE_URLS(id),
            values: { urlIds: selectedRowKeys },
            method: 'post',
            successNotification: {
                type: 'success',
                message: `Đã đẩy ${selectedRowKeys.length} URLs vào hàng đợi cào`,
            },
            onSuccess: () => {
                setSelectedRowKeys([]);
                tableQuery.refetch();
                refetchSession();
            },
        });
    };

    const handleTriggerValidation = async () => {
        await handleCustomMutationData({
            url: API_ENDPOINT.DISCOVERY_SESSIONS.VALIDATE(id),
            values: {},
            method: 'post',
            successNotification: {
                type: 'success',
                message: 'Bắt đầu quá trình đánh giá chất lượng URLs',
            },
            onSuccess: () => {
                tableQuery.refetch();
                refetchSession();
            },
        });
    };

    return {
        session,
        urls,
        tableProps,
        tableQuery,
        debouncedSearch,
        isLoading: isSessionLoading || tableQuery.isLoading,
        isEnqueuing: mutation.mutation.isPending,
        queuedCount,
        selectedRowKeys,
        setSelectedRowKeys,
        handleBatchEnqueue,
        handleTriggerValidation,
        refetchAll: () => {
            tableQuery.refetch();
            refetchSession();
        },
    };
};
