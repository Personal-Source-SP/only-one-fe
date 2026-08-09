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
import type { NDataProvider } from '@/interfaces';
import { formatDate } from '@/libs';
import { PlusOutlined } from '@ant-design/icons';
import { Icon } from '@iconify/react';

import { DataProviderFormModal, DataProviderSettingModal } from './components';
import { useDataProviderPage } from './hooks';
import type { DataProviderRecord } from './types';

const DataProviderPage = () => {
    const {
        tableProps,
        tableQuery,
        createModalForm,
        editModalForm,
        dataProviders,
        settingRecord,
        settingConfigType,
        debouncedSearch,
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
            width: '10%',
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
            width: '15%',
        },
    ];

    const customRowActions: TableCustomAction<DataProviderRecord>[] = [
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
                    customRowActions={customRowActions}
                />
            </ListWrapper>

            <DataProviderFormModal
                modalForm={createModalForm}
                parentOptions={dataProviders ?? []}
            />

            <DataProviderFormModal modalForm={editModalForm} parentOptions={dataProviders ?? []} />

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
