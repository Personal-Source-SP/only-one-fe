'use client';

import { PlusOutlined } from '@ant-design/icons';
import { ColumnsType, CustomButton, CustomSpace, CustomToggle } from '@/components/custom-antd';
import {
    FilterPanel,
    ListTable,
    ListWrapper,
    type CardAction,
    type IFilterField,
} from '@/components/common';
import { formatDate } from '@/libs';
import { RESOURCE } from '@/config';

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

    const columns: ColumnsType<ProviderItemRecord> = [
        {
            title: 'Thông tin đối tượng',
            dataIndex: 'itemAndProviderAndUrl',
            key: 'itemAndProviderAndUrl',
            ellipsis: true,
            width: 200,
            render: (_: any, record: ProviderItemRecord) => (
                <div className="flex flex-col gap-1">
                    <span className="font-semibold text-sm">{record?.item?.name ?? '---'}</span>
                    <span className="text-xs text-hub-subtitle">
                        {record?.dataProvider?.name ?? '---'}
                    </span>
                    <a
                        href={record.itemUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-hub-primary hover:underline truncate"
                    >
                        {record.itemUrl}
                    </a>
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
            title: 'Trạng thái hoạt động',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 140,
            align: 'center',
            render: (isActive: boolean, record: ProviderItemRecord) => (
                <CustomToggle
                    size="small"
                    checked={isActive}
                    onChange={(checked) => handleSwitchStatus(record.id, checked)}
                />
            ),
        },
        {
            title: 'Lưu Cloud',
            dataIndex: 'isSavedToCloudData',
            key: 'isSavedToCloudData',
            width: 120,
            align: 'center',
            render: (isSavedToCloudData: boolean) => (
                <CustomToggle size="small" checked={isSavedToCloudData} disabled />
            ),
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
                    Thêm đối tượng nhà cung cấp
                </CustomButton>
            ),
        },
    ];

    const filters: IFilterField[] = [
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
    ];

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
                    deleteResource={RESOURCE.DATA_PROVIDER_ITEMS}
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
