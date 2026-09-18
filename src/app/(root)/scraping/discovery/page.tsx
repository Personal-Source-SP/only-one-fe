'use client';

import {
    FilterPanel,
    ListTable,
    ListContainer,
    type ICardAction,
    type IFilterField,
} from '@/components/common';
import { CustomButton, CustomTag, type ColumnsType } from '@/components/custom-antd';
import { RESOURCE } from '@/config';
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
        tableProps,
        tableQuery,
        debouncedSearch,
        setFilters,
        createModalForm,
        dataProviderOptions,
        dataProviderQuery,
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

    const actions: ICardAction[] = [
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
            onChange: (val) => debouncedSearch(val?.toString() ?? ''),
        },
        {
            name: 'dataProviderId',
            type: 'select',
            placeholder: 'Chọn nhà cung cấp',
            options: dataProviderOptions,
            onChange: (val) =>
                setFilters([
                    {
                        field: 'dataProviderId',
                        operator: 'eq',
                        value: val,
                    },
                ]),
        },
    ];

    return (
        <>
            <ListContainer
                actions={actions}
                isLoading={tableQuery.isLoading}
                filters={<FilterPanel fields={filters} />}
            >
                <ListTable<IDiscoverySession>
                    columns={columns}
                    tableProps={tableProps}
                    tableQuery={tableQuery}
                    deleteResource={RESOURCE.DISCOVERY_SESSIONS}
                    onView={(record) => router.push(`/scraping/discovery/${record.id}`)}
                />
            </ListContainer>
            <CreateSessionModal
                modalForm={createModalForm}
                dataProviderQuery={dataProviderQuery}
                dataProviderOptions={dataProviderOptions}
            />
        </>
    );
};

export default DiscoveryPage;
