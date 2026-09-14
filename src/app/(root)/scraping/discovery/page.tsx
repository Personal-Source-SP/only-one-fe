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
import { PlusOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { CreateSessionModal } from './components/CreateSessionModal';
import { DISCOVERY_SESSION_STATUS_COLOR_MAP } from './constants';
import { useDiscoveryPage } from './hooks';
import { DiscoverySessionStatus, type IDiscoverySession } from './types';

const DiscoveryPage = () => {
    const router = useRouter();

    const {
        sessions,
        isLoading,
        createModalForm,
        dataProviderOptions,
        dataProviderQuery,
        setSearchTerm,
        setSelectedProviderId,
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
            render: (status: DiscoverySessionStatus) => (
                <CustomTag color={DISCOVERY_SESSION_STATUS_COLOR_MAP[status]}>
                    {status.toUpperCase()}
                </CustomTag>
            ),
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
    ];

    const actions: CardAction[] = [
        {
            component: (
                <CustomButton
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => createModalForm.show()}
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
                    onView={(record) => router.push(`/scraping/discovery/${record.id}`)}
                />
            </ListWrapper>
            <CreateSessionModal
                modalForm={createModalForm}
                dataProviderQuery={dataProviderQuery}
                dataProviderOptions={dataProviderOptions}
            />
        </>
    );
};

export default DiscoveryPage;
