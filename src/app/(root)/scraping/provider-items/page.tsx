'use client';

import { useMemo } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { CustomButton } from '@/components/custom';
import {
    FilterPanel,
    ListTable,
    ListWrapper,
    type CardAction,
    type IFilterField,
} from '@/components/custom-container';

import { getColumns } from './constants';
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

    const columns = useMemo(() => getColumns(handleSwitchStatus), [handleSwitchStatus]);

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
