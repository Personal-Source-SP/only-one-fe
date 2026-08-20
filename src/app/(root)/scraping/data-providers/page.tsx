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
import type { NDataProvider } from '@/interfaces';
import { formatDate } from '@/libs';
import { PlusOutlined } from '@ant-design/icons';
import { Icon } from '@iconify/react';

import { useRouter } from 'next/navigation';
import { DataProviderFormModal, DataProviderSettingModal } from './components';
import { useDataProviderPage } from './hooks';
import type { DataProviderRecord } from './types';

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
            key: 'targetConfig',
            title: 'Cào',
            align: 'center',
            dataIndex: 'targetConfig',
            render: (targetConfig: NDataProvider.ITargetConfig, record) => (
                <CustomButton
                    type="text"
                    title="Cấu hình hàm cào"
                    onClick={() => openSettingModal(record, 'target')}
                    icon={
                        targetConfig ? (
                            <Icon
                                icon="lucide:check-circle-2"
                                className="w-5 h-5 text-emerald-500"
                            />
                        ) : (
                            <Icon icon="lucide:settings" className="w-5 h-5 text-amber-500" />
                        )
                    }
                />
            ),
            width: '8%',
        },
        {
            key: 'searchConfig',
            title: 'Tìm kiếm',
            align: 'center',
            dataIndex: 'searchConfig',
            render: (searchConfig: NDataProvider.ISearchConfig, record) => (
                <CustomButton
                    type="text"
                    title="Cấu hình hàm tìm kiếm"
                    onClick={() => openSettingModal(record, 'search')}
                    icon={
                        searchConfig ? (
                            <Icon
                                icon="lucide:check-circle-2"
                                className="w-5 h-5 text-emerald-500"
                            />
                        ) : (
                            <Icon icon="lucide:search" className="w-5 h-5 text-amber-500" />
                        )
                    }
                />
            ),
            width: '8%',
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
