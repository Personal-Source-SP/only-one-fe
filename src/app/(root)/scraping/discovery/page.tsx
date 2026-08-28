'use client';

import {
    FilterPanel,
    ListTable,
    ListWrapper,
    type CardAction,
    type IFilterField,
} from '@/components/common';
import { CustomButton, CustomTag, type ColumnsType } from '@/components/custom-antd';
import { formatDate } from '@/libs';
import { EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { CreateSessionModal } from './components/CreateSessionModal';
import { useDiscoveryPage } from './hooks';
import { DiscoverySessionStatus, type IDiscoverySession } from './types';

const DiscoveryPage = () => {
    const router = useRouter();
    const {
        sessions,
        isLoading,
        dataProviderOptions,
        setSelectedProviderId,
        setSearchTerm,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isCreating,
        handleCreateSession,
    } = useDiscoveryPage();

    const columns: ColumnsType<IDiscoverySession> = [
        {
            title: 'Mã phiên',
            dataIndex: 'sessionCode',
            key: 'sessionCode',
            render: (code: string) => (
                <span className="font-semibold text-hub-primary">{code}</span>
            ),
        },
        {
            title: 'Nhà cung cấp',
            dataIndex: ['dataProvider', 'name'],
            key: 'dataProvider',
            render: (name: string) => name || '—',
        },
        {
            title: 'URL Khám phá',
            dataIndex: 'targetUrl',
            key: 'targetUrl',
            ellipsis: true,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: DiscoverySessionStatus) => {
                const colorMap = {
                    [DiscoverySessionStatus.COMPLETED]: 'success',
                    [DiscoverySessionStatus.IN_PROGRESS]: 'processing',
                    [DiscoverySessionStatus.FAILED]: 'error',
                    [DiscoverySessionStatus.PENDING]: 'default',
                };
                return <CustomTag color={colorMap[status]}>{status.toUpperCase()}</CustomTag>;
            },
        },
        {
            title: 'URLs tìm thấy',
            dataIndex: 'totalDiscovered',
            key: 'totalDiscovered',
            align: 'right',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: Date) => formatDate(date),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            align: 'center',
            render: (_, record) => (
                <CustomButton
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => router.push(`/scraping/discovery/${record.id}`)}
                >
                    Xem URLs
                </CustomButton>
            ),
        },
    ];

    const actions: CardAction[] = [
        {
            component: (
                <CustomButton
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    Tạo phiên khám phá
                </CustomButton>
            ),
        },
    ];

    const filters: IFilterField[] = [
        {
            name: 'search',
            type: 'input',
            placeholder: 'Tìm theo mã phiên, URL...',
            onChange: (val) => setSearchTerm(val?.toString() || ''),
        },
        {
            name: 'dataProviderId',
            type: 'select',
            placeholder: 'Chọn nhà cung cấp',
            options: dataProviderOptions,
            onChange: (val) => setSelectedProviderId(val?.toString() || undefined),
        },
    ];

    return (
        <>
            <ListWrapper actions={actions} filters={<FilterPanel fields={filters} />}>
                <ListTable<IDiscoverySession>
                    columns={columns}
                    tableProps={{
                        dataSource: sessions,
                        rowKey: 'id',
                        loading: isLoading,
                        pagination: { pageSize: 10, showSizeChanger: true },
                    }}
                />
            </ListWrapper>
            <CreateSessionModal
                open={isCreateModalOpen}
                onCancel={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateSession}
                dataProviderOptions={dataProviderOptions}
                loading={isCreating}
            />
        </>
    );
};

export default DiscoveryPage;
