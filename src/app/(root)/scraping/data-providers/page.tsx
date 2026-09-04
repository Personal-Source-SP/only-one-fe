'use client';

import {
    FilterPanel,
    ListTable,
    ListWrapper,
    type CardAction,
    type IFilterField,
} from '@/components/common';
import { CustomButton, type ColumnsType } from '@/components/custom-antd';
import { DataProviderStatus } from '@/enums';
import { formatDate } from '@/libs';
import { PlusOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { DataProviderFormModal } from './components';
import { DATA_PROVIDER_COLUMNS_WIDTH } from './constants';
import { useDataProviderPage } from './hooks';
import type { IDataProvider } from './types';

const DataProviderPage = () => {
    const router = useRouter();

    const {
        tableProps,
        tableQuery,
        createModalForm,
        editModalForm,
        debouncedSearch,
        setFilters,
        setCurrentPage,
    } = useDataProviderPage();

    const columns: ColumnsType<IDataProvider> = [
        {
            title: 'Tên',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
            sorter: true,
            width: DATA_PROVIDER_COLUMNS_WIDTH.NAME,
            render: (name: string, record) => (
                <CustomButton
                    type="link"
                    className="p-0 font-medium text-hub-primary hover:underline"
                    onClick={() => router.push(`/scraping/features/${record.id}`)}
                >
                    {name}
                </CustomButton>
            ),
        },
        {
            title: 'Mã',
            dataIndex: 'identifier',
            key: 'identifier',
            ellipsis: true,
            sorter: true,
            width: DATA_PROVIDER_COLUMNS_WIDTH.IDENTIFIER,
        },
        {
            title: 'URL cơ sở',
            dataIndex: 'baseUrl',
            key: 'baseUrl',
            ellipsis: true,
            sorter: true,
            width: DATA_PROVIDER_COLUMNS_WIDTH.BASE_URL,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            sorter: true,
            render: (createdAt: Date) => formatDate(createdAt),
            width: DATA_PROVIDER_COLUMNS_WIDTH.CREATED_AT,
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
                    Thêm nhà cung cấp
                </CustomButton>
            ),
        },
    ];

    const filters: IFilterField[] = [
        {
            name: 'search',
            type: 'input',
            isPrimary: true,
            placeholder: 'Tìm kiếm nhà cung cấp...',
            onChange: (value) => debouncedSearch(value?.toString() ?? ''),
        },
        {
            name: 'status',
            type: 'select',
            placeholder: 'Trạng thái',
            options: [
                { label: 'Sẵn sàng', value: DataProviderStatus.READY },
                { label: 'Lỗi', value: DataProviderStatus.ERROR },
                { label: 'Đang kiểm tra', value: DataProviderStatus.TESTING },
                { label: 'Chưa cấu hình', value: DataProviderStatus.UNCONFIGURED },
            ],
            onChange: (val) => {
                setFilters([
                    {
                        field: 'status',
                        operator: 'eq',
                        value: val ?? undefined,
                    },
                ]);
                setCurrentPage(1);
            },
        },
    ];

    return (
        <>
            <ListWrapper
                actions={actions}
                error={tableQuery.error}
                isLoading={tableQuery.isLoading}
                filters={<FilterPanel fields={filters} />}
            >
                <ListTable<IDataProvider>
                    columns={columns}
                    tableProps={tableProps}
                    tableQuery={tableQuery}
                    deleteResource="data-providers"
                    onEdit={(record) => editModalForm.show(record.id)}
                />
            </ListWrapper>

            <DataProviderFormModal modalForm={createModalForm} />
            <DataProviderFormModal modalForm={editModalForm} />
        </>
    );
};

export default DataProviderPage;
