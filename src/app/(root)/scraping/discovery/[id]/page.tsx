'use client';

import type { IDiscoveryUrl } from '@/app/(root)/scraping/discovery/types';
import { FilterPanel, ListTable, ListWrapper } from '@/components/common';
import { CustomSpace } from '@/components/custom-antd';
import { useParams } from 'next/navigation';
import { SessionOverviewCard } from './components';
import { useDiscoveryDetailPage } from './hooks';

const DiscoveryDetailPage = () => {
    const params = useParams();
    const id = (params?.id as string) || '';

    const {
        session,
        urls,
        queuedCount,
        selectedRowKeys,
        setSelectedRowKeys,
        columns,
        actions,
        filters,
    } = useDiscoveryDetailPage(id);

    return (
        <CustomSpace direction="vertical" size={16} className="w-full">
            <SessionOverviewCard
                session={session}
                sessionId={id}
                urlsCount={urls.length}
                queuedCount={queuedCount}
            />

            <ListWrapper actions={actions} filters={<FilterPanel fields={filters} />}>
                <ListTable<IDiscoveryUrl>
                    columns={columns}
                    tableProps={{
                        dataSource: urls,
                        rowKey: 'id',
                        rowSelection: {
                            selectedRowKeys,
                            onChange: (keys) => setSelectedRowKeys(keys as string[]),
                        },
                        pagination: { pageSize: 10, showSizeChanger: true },
                    }}
                />
            </ListWrapper>
        </CustomSpace>
    );
};

export default DiscoveryDetailPage;
