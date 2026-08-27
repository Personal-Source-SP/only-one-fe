'use client';

import {
    enqueueMockUrls,
    getMockSessionById,
    getMockUrlsBySessionId,
} from '@/app/(root)/scraping/discovery/mocks/mock-data';
import {
    DiscoveryUrlStatus,
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
import { formatDate } from '@/libs';
import { SendOutlined } from '@ant-design/icons';
import { Icon } from '@iconify/react';
import { useMemo, useState } from 'react';

export const useDiscoveryDetailPage = (id: string) => {
    const session = useMemo<IDiscoverySession | undefined>(() => getMockSessionById(id), [id]);

    const [urls, setUrls] = useState<IDiscoveryUrl[]>(getMockUrlsBySessionId(id));
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

    const queuedCount = useMemo(
        () => urls.filter((u) => u.status === DiscoveryUrlStatus.QUEUED).length,
        [urls],
    );

    const filteredUrls = useMemo(() => {
        return urls.filter((u) => {
            const matchesSearch =
                !searchTerm ||
                u.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (u.title && u.title.toLowerCase().includes(searchTerm.toLowerCase()));
            return matchesSearch;
        });
    }, [urls, searchTerm]);

    const handleBatchEnqueue = () => {
        if (selectedRowKeys.length === 0) return;
        enqueueMockUrls(selectedRowKeys);
        setUrls(getMockUrlsBySessionId(id));
        setSelectedRowKeys([]);
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
                    </CustomFlex>
                ),
            },
            {
                title: 'Độ sâu phát hiện',
                dataIndex: 'foundAtDepth',
                key: 'foundAtDepth',
                align: 'center',
                width: '14%',
                render: (depth: number) => (
                    <CustomTag color="cyan" className="rounded-md font-mono text-xs px-2 py-0.5">
                        Level {depth}
                    </CustomTag>
                ),
            },
            {
                title: 'Trạng thái',
                dataIndex: 'status',
                key: 'status',
                width: '14%',
                render: (status: DiscoveryUrlStatus) => {
                    const colorMap = {
                        [DiscoveryUrlStatus.DISCOVERED]: 'default',
                        [DiscoveryUrlStatus.QUEUED]: 'processing',
                        [DiscoveryUrlStatus.SCRAPED]: 'success',
                        [DiscoveryUrlStatus.FAILED]: 'error',
                    };
                    return <CustomTag color={colorMap[status]}>{status.toUpperCase()}</CustomTag>;
                },
            },
            {
                title: 'Ngày phát hiện',
                dataIndex: 'createdAt',
                key: 'createdAt',
                width: '16%',
                render: (date: Date) => formatDate(date),
            },
        ],
        [],
    );

    const actions: CardAction[] = useMemo(
        () => [
            {
                component: (
                    <CustomButton
                        type="primary"
                        icon={<SendOutlined />}
                        disabled={selectedRowKeys.length === 0}
                        onClick={handleBatchEnqueue}
                    >
                        Đẩy vào hàng đợi cào ({selectedRowKeys.length})
                    </CustomButton>
                ),
            },
        ],
        [selectedRowKeys.length, handleBatchEnqueue],
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
        urls: filteredUrls,
        queuedCount,
        selectedRowKeys,
        setSelectedRowKeys,
        columns,
        actions,
        filters,
    };
};
