'use client';

import {
    DiscoveryUrlStatus,
    type IDiscoverySession,
    type IDiscoveryUrl,
} from '@/app/(root)/scraping/discovery/types';
import { API_ENDPOINT } from '@/config';
import { useCustomMutationData, useCustomOne, useCustomTable } from '@/hooks';
import { useMemo } from 'react';

export const useDiscoveryDetailPage = (id: string) => {
    const { handleCustomMutationData, mutation } = useCustomMutationData();

    const {
        data: session,
        query: { isLoading: isSessionLoading, refetch: refetchSession },
    } = useCustomOne<IDiscoverySession>({
        id,
        queryOptions: { enabled: Boolean(id) },
        resource: API_ENDPOINT.DISCOVERY_SESSIONS.BASE,
    });

    const table = useCustomTable<IDiscoveryUrl>({
        resource: API_ENDPOINT.DISCOVERY_URLS.BASE,
        enableRowSelection: true,
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
        () => (table.tableProps.dataSource ?? []) as unknown as IDiscoveryUrl[],
        [table.tableProps.dataSource],
    );

    const queuedCount = useMemo(
        () => urls.filter((u) => u.status === DiscoveryUrlStatus.QUEUED).length,
        [urls],
    );

    const handleBatchEnqueue = async () => {
        if (table.selectedRowKeys.length === 0) return;
        await handleCustomMutationData({
            url: API_ENDPOINT.DISCOVERY_SESSIONS.ENQUEUE_URLS(id),
            values: { urlIds: table.selectedRowKeys as string[] },
            method: 'post',
            successNotification: {
                type: 'success',
                message: `Đã đẩy ${table.selectedRowKeys.length} URLs vào hàng đợi cào`,
            },
            onSuccess: () => {
                table.clearSelection();
                table.tableQuery.refetch();
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
                table.tableQuery.refetch();
                refetchSession();
            },
        });
    };

    return {
        session,
        urls,
        table,
        debouncedSearch: table.debouncedSearch,
        isEnqueuing: mutation.mutation.isPending,
        isLoading: isSessionLoading || table.isLoading,
        queuedCount,
        selectedRowKeys: table.selectedRowKeys,
        handleBatchEnqueue,
        handleTriggerValidation,
        refetchAll: () => {
            table.tableQuery.refetch();
            refetchSession();
        },
    };
};
