'use client';

import { useMemo } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { ColumnsType, CustomButton, CustomSpace, CustomToggle } from '@/components/custom-antd';
import {
    FilterPanel,
    ListTable,
    ListWrapper,
    type CardAction,
    type IFilterField,
} from '@/components/common';
import type { NDataProvider } from '@/interfaces';
import { formatDate } from '@/libs';

import { useDataProviderItemPage } from './hooks';
import { ProcessScrapeData, ProviderItemFormModal } from './components';
import type { ProviderItemRecord } from './types';

const DataProviderItemPage = () => {
    const {
        loading,
        tableProps,
        tableQuery,
        debouncedSearch,
        setFilters,
        createModalForm,
        editModalForm,
        openProcessScrapeDataModal,
        setOpenProcessScrapeDataModal,
        selectedDataProviderItemIds,
        itemOptions,
        cloudDataProviderOptions,
        dataProviderOptions,
        dataProviderQuery,
        handleSwitchStatus,
    } = useDataProviderItemPage();

    const columns = useMemo<ColumnsType<NDataProvider.IDataProviderItem>>(
        () => [
            {
                title: 'Thông tin đối tượng',
                dataIndex: 'itemAndProviderAndUrl',
                key: 'itemAndProviderAndUrl',
                ellipsis: true,
                width: 200,
                render: (_: any, record: NDataProvider.IDataProviderItem) => (
                    <div className="text-sm">
                        <p>
                            <strong>Nhà cung cấp:</strong> {record?.dataProvider?.name ?? '---'}
                        </p>
                        <p>
                            <strong>URL đối tượng:</strong> {record?.itemUrl ?? '---'}
                        </p>
                        <p>
                            <strong>Đối tượng:</strong> {record?.item?.name ?? '---'}
                        </p>
                    </div>
                ),
            },
            {
                title: 'Ngày cào gần nhất',
                dataIndex: 'lastScrapedTimestamp',
                key: 'lastScrapedTimestamp',
                sorter: true,
                width: 150,
                render: (lastScrapedTimestamp: Date) => formatDate(lastScrapedTimestamp),
            },
            {
                title: 'Ngày tạo',
                dataIndex: 'createdAt',
                key: 'createdAt',
                sorter: true,
                width: 150,
                render: (createdAt: Date) => formatDate(createdAt),
            },
            {
                title: 'Trạng thái',
                dataIndex: 'isActive',
                key: 'isActive',
                align: 'center',
                width: 100,
                render: (isActive: boolean, record: NDataProvider.IDataProviderItem) => (
                    <CustomToggle
                        size="small"
                        checked={isActive}
                        onChange={(checked) => handleSwitchStatus(record?.id ?? '', checked)}
                    />
                ),
            },
            {
                title: 'Lưu vào kho dữ liệu',
                dataIndex: 'isSavedToCloudData',
                key: 'isSavedToCloudData',
                align: 'center',
                width: 100,
                render: (isSavedToCloudData: boolean, record: NDataProvider.IDataProviderItem) => (
                    <CustomSpace>
                        <CustomToggle size="small" checked={isSavedToCloudData} disabled />
                        <p>{record?.cloudDataProvider?.name ?? '---'}</p>
                    </CustomSpace>
                ),
            },
        ],
        [handleSwitchStatus],
    );

    const actions = useMemo<CardAction[]>(
        () => [
            {
                component: (
                    <CustomButton
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => createModalForm.show()}
                    >
                        Thêm đối tượng nhà cung cấp
                    </CustomButton>
                ),
            },
        ],
        [createModalForm],
    );

    const filters = useMemo<IFilterField[]>(
        () => [
            {
                name: 'search',
                type: 'input',
                placeholder: 'Tìm kiếm đối tượng nhà cung cấp...',
                onChange: (value) => debouncedSearch(value?.toString() ?? ''),
            },
            {
                name: 'dataProviderId',
                type: 'select',
                options: dataProviderOptions ?? [],
                placeholder: 'Chọn nhà cung cấp',
                onChange: (val) =>
                    setFilters([
                        {
                            field: 'dataProviderId',
                            operator: 'eq',
                            value: val,
                        },
                    ]),
            },
            {
                name: 'itemId',
                type: 'select',
                options: itemOptions ?? [],
                placeholder: 'Chọn đối tượng',
                onChange: (val) =>
                    setFilters([
                        {
                            field: 'itemId',
                            operator: 'eq',
                            value: val,
                        },
                    ]),
            },
        ],
        [debouncedSearch, dataProviderOptions, itemOptions, setFilters],
    );

    return (
        <>
            <ListWrapper
                actions={actions}
                error={tableQuery.error}
                isLoading={loading || tableQuery.isLoading}
                filters={<FilterPanel fields={filters} />}
            >
                <ListTable<ProviderItemRecord>
                    columns={columns}
                    tableProps={tableProps}
                    tableQuery={tableQuery}
                    deleteResource="data-provider-items"
                    onEdit={(record) => editModalForm.show(record.id)}
                />
            </ListWrapper>

            <ProviderItemFormModal
                modalForm={createModalForm}
                itemOptions={itemOptions ?? []}
                dataProviderOptions={dataProviderOptions ?? []}
                cloudDataProviderOptions={cloudDataProviderOptions ?? []}
                dataProviderQuery={dataProviderQuery}
            />

            <ProviderItemFormModal
                modalForm={editModalForm}
                itemOptions={itemOptions ?? []}
                dataProviderOptions={dataProviderOptions ?? []}
                cloudDataProviderOptions={cloudDataProviderOptions ?? []}
                dataProviderQuery={dataProviderQuery}
            />

            {openProcessScrapeDataModal && (
                <ProcessScrapeData
                    key="process-scrape-data"
                    open={openProcessScrapeDataModal}
                    onClose={() => setOpenProcessScrapeDataModal(false)}
                    selectedDataProviderItemIds={selectedDataProviderItemIds}
                />
            )}
        </>
    );
};

export default DataProviderItemPage;
