'use client';

import {
    DiscoveryUrlStatus,
    ValidationMatchResult,
    type IDiscoverySession,
    type IDiscoveryUrl,
} from '@/app/(root)/scraping/discovery/types';
import type { CardAction, IFilterField } from '@/components/common';
import {
    CustomButton,
    CustomFlex,
    CustomTag,
    CustomTypography,
    type ColumnsType,
} from '@/components/custom-antd';
import { API_ENDPOINT } from '@/config';
import { useCustomList, useCustomMutationData, useCustomOne } from '@/hooks';
import { formatDate } from '@/libs';
import { CheckCircleOutlined, SendOutlined } from '@ant-design/icons';
import { Icon } from '@iconify/react';
import type { CrudFilter } from '@refinedev/core';
import { useMemo, useState } from 'react';

export const useDiscoveryDetailPage = (id: string) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
    const { handleCustomMutationData, mutation } = useCustomMutationData();

    // 1. Query Session Details
    const {
        data: session,
        query: { isLoading: isSessionLoading, refetch: refetchSession },
    } = useCustomOne<IDiscoverySession>({
        resource: API_ENDPOINT.DISCOVERY_SESSIONS.BASE,
        id,
        enabled: Boolean(id),
    });

    // 2. Query Discovered URLs
    const queryFilters: CrudFilter[] = useMemo(() => {
        const list: CrudFilter[] = [
            {
                field: 'sessionId',
                operator: 'eq',
                value: id,
            },
        ];
        if (searchTerm) {
            list.push({
                field: 'search',
                operator: 'contains',
                value: searchTerm,
            });
        }
        return list;
    }, [id, searchTerm]);

    const {
        data: urls = [],
        query: { isLoading: isUrlsLoading, refetch: refetchUrls },
    } = useCustomList<IDiscoveryUrl>({
        resource: API_ENDPOINT.DISCOVERY_URLS.BASE,
        filters: queryFilters,
        queryOptions: {
            enabled: Boolean(id),
        },
    });

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
            successMessage: `Đã đẩy ${selectedRowKeys.length} URLs vào hàng đợi cào`,
            onSuccess: () => {
                setSelectedRowKeys([]);
                refetchUrls();
                refetchSession();
            },
        });
    };

    const handleTriggerValidation = async () => {
        await handleCustomMutationData({
            url: API_ENDPOINT.DISCOVERY_SESSIONS.VALIDATE(id),
            values: {},
            method: 'post',
            successMessage: 'Bắt đầu quá trình đánh giá chất lượng URLs',
            onSuccess: () => {
                refetchUrls();
                refetchSession();
            },
        });
    };

    const columns: ColumnsType<IDiscoveryUrl> = useMemo(
        () => [
            {
                title: 'Tiêu đề & Đường dẫn',
                dataIndex: 'url',
                key: 'url',
                render: (url: string, record) => (
                    <CustomFlex vertical gap={4}>
                        <CustomTypography.Text strong className="text-hub-title text-sm">
                            {record.title || 'Không có tiêu đề'}
                        </CustomTypography.Text>
                        <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="max-w-xl truncate text-xs text-hub-primary hover:underline inline-flex items-center gap-1.5"
                        >
                            <Icon
                                icon="lucide:external-link"
                                className="w-3.5 h-3.5 shrink-0 opacity-70"
                            />
                            <span className="truncate">{url}</span>
                        </a>
                        {record.priceDetected && record.detectedPrice && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                    💰 {record.detectedCurrency || '$'}{' '}
                                    {record.detectedPrice.toLocaleString()}
                                </span>
                                {record.confidenceScore !== undefined && (
                                    <span className="text-[11px] text-slate-500 font-mono">
                                        Score: {(record.confidenceScore * 100).toFixed(0)}%
                                    </span>
                                )}
                            </div>
                        )}
                    </CustomFlex>
                ),
            },
            {
                title: 'Độ khớp',
                dataIndex: 'matchResult',
                key: 'matchResult',
                width: '13%',
                render: (match?: ValidationMatchResult) => {
                    if (!match) return <span className="text-xs text-slate-400">—</span>;
                    const colorMap = {
                        [ValidationMatchResult.EXACT_MATCH]: 'green',
                        [ValidationMatchResult.PARTIAL_MATCH]: 'orange',
                        [ValidationMatchResult.NO_MATCH]: 'red',
                    };
                    const labelMap = {
                        [ValidationMatchResult.EXACT_MATCH]: 'Khớp chính xác',
                        [ValidationMatchResult.PARTIAL_MATCH]: 'Khớp một phần',
                        [ValidationMatchResult.NO_MATCH]: 'Không khớp',
                    };
                    return <CustomTag color={colorMap[match]}>{labelMap[match]}</CustomTag>;
                },
            },
            {
                title: 'Độ sâu phát hiện',
                dataIndex: 'foundAtDepth',
                key: 'foundAtDepth',
                align: 'center',
                width: '12%',
                render: (depth: number) => (
                    <CustomTag color="cyan" className="rounded-md font-mono text-xs px-2 py-0.5">
                        Level {depth || 1}
                    </CustomTag>
                ),
            },
            {
                title: 'Trạng thái',
                dataIndex: 'status',
                key: 'status',
                width: '13%',
                render: (status: DiscoveryUrlStatus) => {
                    const colorMap = {
                        [DiscoveryUrlStatus.DISCOVERED]: 'default',
                        [DiscoveryUrlStatus.QUEUED]: 'processing',
                        [DiscoveryUrlStatus.SCRAPED]: 'success',
                        [DiscoveryUrlStatus.FAILED]: 'error',
                    };
                    return <CustomTag color={colorMap[status]}>{status?.toUpperCase()}</CustomTag>;
                },
            },
            {
                title: 'Ngày phát hiện',
                dataIndex: 'createdAt',
                key: 'createdAt',
                width: '15%',
                render: (date: Date) => formatDate(date),
            },
        ],
        [],
    );

    const actions: CardAction[] = useMemo(
        () => [
            {
                component: (
                    <CustomButton icon={<CheckCircleOutlined />} onClick={handleTriggerValidation}>
                        Chấm điểm URLs (Validate)
                    </CustomButton>
                ),
            },
            {
                component: (
                    <CustomButton
                        type="primary"
                        icon={<SendOutlined />}
                        disabled={selectedRowKeys.length === 0}
                        loading={mutation.mutation.isPending}
                        onClick={handleBatchEnqueue}
                    >
                        Đẩy vào hàng đợi cào ({selectedRowKeys.length})
                    </CustomButton>
                ),
            },
        ],
        [
            selectedRowKeys.length,
            mutation.mutation.isPending,
            handleBatchEnqueue,
            handleTriggerValidation,
        ],
    );

    const filters: IFilterField[] = useMemo(
        () => [
            {
                name: 'search',
                type: 'input',
                placeholder: 'Tìm kiếm theo URL hoặc tiêu đề...',
                onChange: (val) => setSearchTerm(val?.toString() || ''),
            },
        ],
        [setSearchTerm],
    );

    return {
        session,
        urls,
        isLoading: isSessionLoading || isUrlsLoading,
        isEnqueuing: mutation.mutation.isPending,
        queuedCount,
        selectedRowKeys,
        setSelectedRowKeys,
        columns,
        actions,
        filters,
        refetchAll: () => {
            refetchUrls();
            refetchSession();
        },
    };
};
