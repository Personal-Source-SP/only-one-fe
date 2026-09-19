'use client';

import {
    DISCOVERY_URL_STATUS_COLOR_MAP,
    VALIDATION_MATCH_RESULT_COLOR_MAP,
    VALIDATION_MATCH_RESULT_LABELS,
} from '@/app/(root)/scraping/discovery/constants';
import {
    DiscoveryUrlStatus,
    ValidationMatchResult,
    type IDiscoverySession,
    type IDiscoveryUrl,
} from '@/app/(root)/scraping/discovery/types';
import { ListContainer, ListTable, type ICardAction, type IFilterField } from '@/components/common';
import {
    CustomButton,
    CustomFlex,
    CustomSpace,
    CustomTag,
    CustomTypography,
    type ColumnsType,
} from '@/components/custom-antd';
import { API_ENDPOINT } from '@/config';
import { useCustomMutationData, useCustomOne, useCustomTable } from '@/hooks';
import { formatDate } from '@/libs';
import { CheckCircleOutlined, SendOutlined } from '@ant-design/icons';
import { Icon } from '@iconify/react';
import { useParams } from 'next/navigation';
import type React from 'react';
import { useState } from 'react';
import { SessionOverviewCard } from './components';

export default function DiscoveryDetailPage() {
    const params = useParams();
    const id = (params?.id as string) || '';
    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

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

    const {
        data: session,
        query: { isLoading: isSessionLoading, refetch: refetchSession },
    } = useCustomOne<IDiscoverySession>({
        id,
        queryOptions: { enabled: Boolean(id) },
        resource: API_ENDPOINT.DISCOVERY_SESSIONS.BASE,
    });

    const { handleCustomMutationData, mutation } = useCustomMutationData();

    const handleBatchEnqueue = async () => {
        if (selectedRowKeys.length === 0) return;

        await handleCustomMutationData({
            method: 'post',
            values: { urlIds: selectedRowKeys },
            url: API_ENDPOINT.DISCOVERY_SESSIONS.ENQUEUE_URLS(id),
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
            values: {},
            method: 'post',
            url: API_ENDPOINT.DISCOVERY_SESSIONS.VALIDATE(id),
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

    const isEnqueuing = mutation.mutation.isPending;
    const isLoading = isSessionLoading || tableQuery.isLoading;
    const urls = (tableProps.dataSource ?? []) as unknown as IDiscoveryUrl[];
    const queuedCount = urls.filter((u) => u.status === DiscoveryUrlStatus.QUEUED).length;

    const columns: ColumnsType<IDiscoveryUrl> = [
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
                        className="inline-flex max-w-xl items-center gap-1.5 truncate text-xs text-hub-primary hover:underline"
                    >
                        <Icon
                            icon="lucide:external-link"
                            className="h-3.5 w-3.5 shrink-0 opacity-70"
                        />
                        <span className="truncate">{url}</span>
                    </a>
                    {record.priceDetected && record.detectedPrice && (
                        <div className="mt-0.5 flex items-center gap-1.5">
                            <span className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:border-emerald-800 dark:bg-emerald-950/40">
                                💰 {record.detectedCurrency || '$'}{' '}
                                {record.detectedPrice.toLocaleString()}
                            </span>
                            {record.confidenceScore !== undefined && (
                                <span className="font-mono text-[11px] text-slate-500">
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
                return (
                    <CustomTag color={VALIDATION_MATCH_RESULT_COLOR_MAP[match]}>
                        {VALIDATION_MATCH_RESULT_LABELS[match]}
                    </CustomTag>
                );
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
            render: (status: DiscoveryUrlStatus) => (
                <CustomTag color={DISCOVERY_URL_STATUS_COLOR_MAP[status]}>
                    {status?.toUpperCase()}
                </CustomTag>
            ),
        },
        {
            title: 'Ngày phát hiện',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: '15%',
            sorter: true,
            render: (date: Date) => formatDate(date),
        },
    ];

    const actions: ICardAction[] = [
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
                    loading={isEnqueuing}
                    icon={<SendOutlined />}
                    onClick={handleBatchEnqueue}
                    disabled={selectedRowKeys.length === 0}
                >
                    Đẩy vào hàng đợi cào ({selectedRowKeys.length})
                </CustomButton>
            ),
        },
    ];

    const filters: IFilterField[] = [
        {
            name: 'search',
            type: 'input',
            isPrimary: true,
            placeholder: 'Tìm kiếm theo URL hoặc tiêu đề...',
            onChange: (val) => debouncedSearch(val?.toString() || ''),
        },
    ];

    return (
        <CustomSpace direction="vertical" size={16} className="w-full">
            <SessionOverviewCard
                sessionId={id}
                session={session}
                urlsCount={urls.length}
                queuedCount={queuedCount}
            />

            <ListContainer actions={actions} filters={filters} isLoading={isLoading}>
                <ListTable<IDiscoveryUrl>
                    columns={columns}
                    tableQuery={tableQuery}
                    tableProps={{
                        ...tableProps,
                        dataSource: urls,
                        rowSelection: {
                            selectedRowKeys,
                            onChange: (keys: React.Key[]) => setSelectedRowKeys(keys as string[]),
                        },
                    }}
                />
            </ListContainer>
        </CustomSpace>
    );
}
