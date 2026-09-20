'use client';

import { useMemo } from 'react';

import {
    DiscoveryUrlStatus,
    type IDiscoverySession,
    type IDiscoveryUrl,
} from '@/app/(root)/scraping/discovery/types';
import { API_ENDPOINT } from '@/config';
import { useCustomMutationData, useCustomOne, useCustomTable } from '@/hooks';

export const useDiscoveryDetailPage = (id: string) => {
    const { handleCustomMutationData, isLoading: isEnqueuing } = useCustomMutationData();

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
        if (!table.selectionProps.hasSelected) return;

        await handleCustomMutationData({
            method: 'post',
            url: API_ENDPOINT.DISCOVERY_SESSIONS.ENQUEUE_URLS(id),
            values: { urlIds: table.selectionProps.selectedRowKeys as string[] },
            successNotification: {
                type: 'success',
                message: `Đã đẩy ${table.selectionProps.selectedCount} URLs vào hàng đợi cào`,
            },
            onSuccess: () => {
                table.selectionProps.clearSelection();
                table.tableQuery.refetch();

                refetchSession();
            },
        });
    };

    const handleTriggerValidation = async () => {
        await handleCustomMutationData({
            values: {},
            method: 'post',
            url: API_ENDPOINT.DISCOVERY_SESSIONS.VALIDATE(id),
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
        urls,
        table,
        session,
        queuedCount,
        isEnqueuing,
        handleBatchEnqueue,
        handleTriggerValidation,
    };
};
