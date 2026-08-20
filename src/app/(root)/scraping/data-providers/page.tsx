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
import { DataProviderSearchStatus, DataProviderStatus } from '@/enums';
import { formatDate } from '@/libs';
import { PlusOutlined } from '@ant-design/icons';
import { Icon } from '@iconify/react';

import { useRouter } from 'next/navigation';
import { DataProviderFormModal, DataProviderSettingModal } from './components';
import { useDataProviderPage } from './hooks';
import type { DataProviderRecord, ISearchConfig, ITargetConfig } from './types';

const DataProviderPage = () => {
    const router = useRouter();
    const {
        tableProps,
        tableQuery,
        createModalForm,
        editModalForm,
        settingRecord,
        settingConfigType,
        debouncedSearch,
        setFilters,
        setCurrentPage,
        openSettingModal,
        closeSettingModal,
    } = useDataProviderPage();

    const columns: ColumnsType<DataProviderRecord> = [
        {
            title: 'Tên',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
            sorter: true,
            width: '15%',
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
            width: '15%',
        },
        {
            key: 'features',
            title: 'Tính năng',
            align: 'center',
            width: '15%',
            render: (_, record) => (
                <CustomButton
                    type="link"
                    icon={<Icon icon="lucide:layers" className="w-4 h-4 text-hub-primary" />}
                    onClick={() => router.push(`/scraping/features/${record.id}`)}
                >
                    Quản lý Features
                </CustomButton>
            ),
        },
        {
            title: 'Cấu hình cào',
            dataIndex: 'targetConfig',
            key: 'targetConfig',
            width: 140,
            render: (targetConfig: ITargetConfig, record) => (
                <CustomButton
                    size="small"
                    type="link"
                    icon={<Icon icon="lucide:settings" className="text-base" />}
                    onClick={() => openSettingModal(record, 'target')}
                >
                    {targetConfig?.functionGenerator ? 'Đã cấu hình' : 'Chưa cấu hình'}
                </CustomButton>
            ),
        },
        {
            title: 'Trạng thái tìm kiếm',
            dataIndex: 'searchStatus',
            key: 'searchStatus',
            width: 170,
            render: (searchStatus: DataProviderSearchStatus) => <StatusTag status={searchStatus} />,
        },
        {
            title: 'Cấu hình tìm kiếm',
            dataIndex: 'searchConfig',
            key: 'searchConfig',
            width: 150,
            render: (searchConfig: ISearchConfig, record) => (
                <CustomButton
                    size="small"
                    type="link"
                    icon={<Icon icon="lucide:settings" className="text-base" />}
                    onClick={() => openSettingModal(record, 'search')}
                />
            ),
        },
    ];

    const customRowActions: TableCustomAction<DataProviderRecord>[] = [
        {
            key: 'manage-features',
            icon: <Icon icon="lucide:layers" />,
            tooltip: 'Quản lý tính năng',
            onClick: (record) => router.push(`/scraping/features/${record.id}`),
        },
        {
            key: 'setting-target-function',
            icon: <Icon icon="lucide:settings" />,
            tooltip: 'Cấu hình hàm cào',
            onClick: (record) => openSettingModal(record, 'target'),
        },
        {
            key: 'setting-search-function',
            icon: <Icon icon="lucide:search" />,
            tooltip: 'Cấu hình hàm tìm kiếm',
            onClick: (record) => openSettingModal(record, 'search'),
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
            placeholder: 'Trạng thái cào',
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
        {
            name: 'searchStatus',
            type: 'select',
            placeholder: 'Trạng thái tìm kiếm',
            options: [
                { label: 'Sẵn sàng', value: DataProviderSearchStatus.READY },
                { label: 'Lỗi', value: DataProviderSearchStatus.ERROR },
                { label: 'Đang kiểm tra', value: DataProviderSearchStatus.TESTING },
                { label: 'Chưa cấu hình', value: DataProviderSearchStatus.UNCONFIGURED },
            ],
            onChange: (val) => {
                setFilters([
                    {
                        field: 'searchStatus',
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
                <ListTable<DataProviderRecord>
                    columns={columns}
                    tableProps={tableProps}
                    tableQuery={tableQuery}
                    deleteResource="data-providers"
                    onEdit={(record) => editModalForm.show(record.id)}
                    customRowActions={customRowActions}
                />
            </ListWrapper>

            <DataProviderFormModal modalForm={createModalForm} />

            <DataProviderFormModal modalForm={editModalForm} />

            <DataProviderSettingModal
                open={!!settingRecord}
                record={settingRecord}
                configType={settingConfigType}
                onClose={closeSettingModal}
                onSuccess={() => tableQuery.refetch()}
            />
        </>
    );
};

export default DataProviderPage;
