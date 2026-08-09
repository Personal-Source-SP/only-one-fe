'use client';

import {
    FilterPanel,
    ListTable,
    ListWrapper,
    StatusTag,
    type CardAction,
    type IFilterField,
} from '@/components/common';
import { CustomButton, type ColumnsType } from '@/components/custom-antd';
import { DataProviderStatus } from '@/enums';
import type { NDataProvider } from '@/interfaces';
import { formatDate } from '@/libs';
import { PlusOutlined } from '@ant-design/icons';
import { Icon } from '@iconify/react';

import { DataProviderFormModal } from './components';
import { useDataProviderPage } from './hooks';
import type { DataProviderRecord } from './types';

const DataProviderPage = () => {
    const {
        tableProps,
        tableQuery,
        createModalForm,
        editModalForm,
        dataProviders,
        debouncedSearch,
    } = useDataProviderPage();

    const columns: ColumnsType<DataProviderRecord> = [
        {
            title: 'Tên',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
            sorter: true,
            width: '15%',
        },
        {
            title: 'Mã',
            dataIndex: 'identifier',
            key: 'identifier',
            ellipsis: true,
            sorter: true,
            width: '10%',
        },
        {
            title: 'URL cơ sở',
            dataIndex: 'baseUrl',
            key: 'baseUrl',
            ellipsis: true,
            sorter: true,
            width: '20%',
        },
        {
            key: 'status',
            title: 'Trạng thái',
            dataIndex: 'status',
            render: (status: DataProviderStatus) => <StatusTag status={status} />,
            width: '10%',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            sorter: true,
            render: (createdAt: Date) => formatDate(createdAt),
            width: '20%',
        },
        {
            key: 'targetConfig',
            title: 'Cào',
            align: 'center',
            dataIndex: 'targetConfig',
            render: (targetConfig: NDataProvider.ITargetConfig) =>
                targetConfig ? (
                    <Icon icon="lucide:check" className="w-full" />
                ) : (
                    <Icon icon="lucide:x" className="w-full" />
                ),
            width: '10%',
        },
        {
            key: 'searchConfig',
            title: 'Tìm kiếm',
            align: 'center',
            dataIndex: 'searchConfig',
            render: (searchConfig: NDataProvider.ISearchConfig) =>
                searchConfig ? (
                    <Icon icon="lucide:check" className="w-full" />
                ) : (
                    <Icon icon="lucide:x" className="w-full" />
                ),
            width: '15%',
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
            placeholder: 'Tìm kiếm nhà cung cấp...',
            onChange: (value) => debouncedSearch(value?.toString() ?? ''),
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
                <ListTable<DataProviderRecord>
                    columns={columns}
                    tableProps={tableProps}
                    tableQuery={tableQuery}
                    deleteResource="data-providers"
                    onEdit={(record) => editModalForm.show(record.id)}
                />
            </ListWrapper>

            <DataProviderFormModal
                modalForm={createModalForm}
                parentOptions={dataProviders ?? []}
            />

            <DataProviderFormModal modalForm={editModalForm} parentOptions={dataProviders ?? []} />
        </>
    );
};

export default DataProviderPage;
