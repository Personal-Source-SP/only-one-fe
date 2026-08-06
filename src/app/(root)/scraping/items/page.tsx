'use client';

import { useMemo } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { ColumnType, CustomButton } from '@/components/custom';
import {
    FilterPanel,
    ListTable,
    ListWrapper,
    type CardAction,
    type IFilterField,
} from '@/components/custom-container';
import { DataImportType } from '@/enums';

import { columns, importDataColumns } from './constants';
import { useItemPage } from './hooks';
import { ImportData, ItemFormModal, ProcessScrapeData } from './components';
import type { ItemRecord } from './types';

const ItemPage = () => {
    const {
        tableProps,
        tableQuery,
        debouncedSearch,
        createModalForm,
        editModalForm,
        openImportItemModal,
        setOpenImportItemModal,
        selectedItemIds,
        openProcessScrapeDataModal,
        setOpenProcessScrapeDataModal,
    } = useItemPage();

    const actions = useMemo<CardAction[]>(
        () => [
            {
                component: (
                    <CustomButton
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => createModalForm.show()}
                    >
                        Thêm đối tượng
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
                placeholder: 'Tìm kiếm đối tượng...',
                onChange: (value) => debouncedSearch(value?.toString() ?? ''),
            },
        ],
        [debouncedSearch],
    );

    return (
        <>
            <ListWrapper
                actions={actions}
                error={tableQuery.error}
                isLoading={tableQuery.isLoading}
                filters={<FilterPanel fields={filters} />}
            >
                <ListTable<ItemRecord>
                    columns={columns}
                    tableProps={tableProps}
                    tableQuery={tableQuery}
                    deleteResource="items"
                    onEdit={(record) => editModalForm.show(record.id)}
                />
            </ListWrapper>

            <ItemFormModal modalForm={createModalForm} />
            <ItemFormModal modalForm={editModalForm} />

            {openImportItemModal && (
                <ImportData
                    key="import-item"
                    open={openImportItemModal}
                    dataType={DataImportType.ITEM}
                    onClose={() => setOpenImportItemModal(false)}
                    onSuccess={() => tableQuery.refetch()}
                    columns={importDataColumns as unknown as ColumnType<Record<string, any>>[]}
                />
            )}

            {openProcessScrapeDataModal && (
                <ProcessScrapeData
                    key="process-scrape-data"
                    open={openProcessScrapeDataModal}
                    selectedItemIds={selectedItemIds}
                    onClose={() => setOpenProcessScrapeDataModal(false)}
                />
            )}
        </>
    );
};

export default ItemPage;
