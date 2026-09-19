'use client';

import { ListContainer, ListTable, type ICardAction, type IFilterField } from '@/components/common';
import {
    CustomButton,
    CustomFlex,
    CustomTag,
    CustomTypography,
    type ColumnsType,
} from '@/components/custom-antd';
import { formatDate } from '@/libs';
import { CheckCircleOutlined, SendOutlined } from '@ant-design/icons';
import { Icon } from '@iconify/react';
import { useParams } from 'next/navigation';
import {
    DISCOVERY_URL_STATUS_COLOR_MAP,
    VALIDATION_MATCH_RESULT_COLOR_MAP,
    VALIDATION_MATCH_RESULT_LABELS,
} from '../constants';
import { DiscoveryUrlStatus, ValidationMatchResult, type IDiscoveryUrl } from '../types';
import { SessionOverviewCard } from './components';
import { useDiscoveryDetailPage } from './hooks';

export default function DiscoveryDetailPage() {
    const params = useParams();
    const id = (params?.id as string) || '';

    const {
        urls,
        table,
        session,
        isEnqueuing,
        queuedCount,
        handleBatchEnqueue,
        handleTriggerValidation,
    } = useDiscoveryDetailPage(id);

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
                    disabled={!table.selectionProps.hasSelected}
                >
                    Đẩy vào hàng đợi cào ({table.selectionProps.selectedCount})
                </CustomButton>
            ),
        },
    ];

    const filters: IFilterField[] = [
        {
            type: 'input',
            name: 'search',
            isPrimary: true,
            placeholder: 'Tìm kiếm theo URL hoặc tiêu đề...',
            onChange: (val) => table.debouncedSearch(val?.toString() || ''),
        },
    ];

    return (
        <ListContainer
            actions={actions}
            filters={filters}
            isLoading={table.isLoading}
            top={
                <SessionOverviewCard
                    sessionId={id}
                    session={session}
                    urlsCount={urls.length}
                    queuedCount={queuedCount}
                />
            }
        >
            <ListTable<IDiscoveryUrl> columns={columns} table={table} />
        </ListContainer>
    );
}
