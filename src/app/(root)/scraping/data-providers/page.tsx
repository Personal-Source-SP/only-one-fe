'use client';

import {
    FilterPanel,
    ListTable,
    ListWrapper,
    StatusTag,
    type CardAction,
    type IFilterField,
    type TableCustomAction,
} from '@/components/common';
import { CustomButton, type ColumnsType } from '@/components/custom-antd';
import { DataProviderStatus } from '@/enums';
import { formatDate } from '@/libs';
import { PlusOutlined } from '@ant-design/icons';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/navigation';
import { DataProviderFormModal } from './components';
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
            width: '25%',
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
            width: '15%',
        },
        {
            title: 'URL cơ sở',
            dataIndex: 'baseUrl',
            key: 'baseUrl',
            ellipsis: true,
            sorter: true,
            width: '30%',
        },
        {
            key: 'status',
            title: 'Trạng thái',
            dataIndex: 'status',
            render: (status: DataProviderStatus) => <StatusTag status={status} />,
            width: '15%',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            sorter: true,
            render: (createdAt: Date) => formatDate(createdAt),
            width: '15%',
        },
    ];

    const customRowActions: TableCustomAction<IDataProvider>[] = [
        {
            key: 'manage-features',
            icon: <Icon icon="lucide:layers" />,
            tooltip: 'Quản lý tính năng',
            onClick: (record) => router.push(`/scraping/features/${record.id}`),
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
                    customRowActions={customRowActions}
                    onEdit={(record) => editModalForm.show(record.id)}
                />
            </ListWrapper>

            <DataProviderFormModal modalForm={createModalForm} />

            <DataProviderFormModal modalForm={editModalForm} />
        </>
    );
};

export default DataProviderPage;
