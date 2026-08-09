'use client';

import { PlusOutlined } from '@ant-design/icons';
import { ColumnsType, CustomButton } from '@/components/custom-antd';
import {
    FilterPanel,
    ListTable,
    ListWrapper,
    StatusTag,
    type CardAction,
    type IFilterField,
} from '@/components/common';
import { CloudDataProviderType } from '@/enums';
import type { NCloudData } from '@/interfaces';
import { capitalizeFirstLetter, formatDate, formatFileSize } from '@/libs';

import { useCloudDataProviderPage } from './hooks';
import { CloudProviderFormModal } from './components';
import type { CloudProviderRecord } from './types';

const CloudDataProvider = () => {
    const { tableProps, tableQuery, debouncedSearch, createModalForm, editModalForm } =
        useCloudDataProviderPage();

    const columns: ColumnsType<NCloudData.ICloudDataProvider> = [
        {
            title: 'STT',
            key: 'index',
            dataIndex: 'index',
            width: 60,
            align: 'center',
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: 'Tên kho',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            ellipsis: true,
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            width: 150,
            render: (type: CloudDataProviderType) => (
                <StatusTag status={capitalizeFirstLetter(type)} />
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 150,
            align: 'center',
            render: (isActive: boolean) => <StatusTag status={isActive ? 'active' : 'inactive'} />,
        },
        {
            title: 'Tổng số dữ liệu',
            dataIndex: 'totalItems',
            key: 'totalItems',
            width: 150,
            align: 'center',
            render: (totalItems: number) => totalItems?.toLocaleString() ?? 0,
        },
        {
            title: 'Tổng dung lượng',
            dataIndex: 'totalSize',
            key: 'totalSize',
            width: 150,
            align: 'center',
            render: (totalSize: number) => formatFileSize(totalSize),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 200,
            sorter: true,
            render: (createdAt: Date) => formatDate(createdAt),
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
                <ListTable<CloudProviderRecord>
                    columns={columns}
                    tableProps={tableProps}
                    tableQuery={tableQuery}
                    deleteResource="cloud-data-providers"
                    onEdit={(record) => editModalForm.show(record.id)}
                />
            </ListWrapper>

            <CloudProviderFormModal modalForm={createModalForm} />
            <CloudProviderFormModal modalForm={editModalForm} />
        </>
    );
};

export default CloudDataProvider;
