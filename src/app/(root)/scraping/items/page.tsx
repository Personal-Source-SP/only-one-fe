'use client';

import { ReactNode } from 'react';
import { Icon } from '@iconify/react';
import { CreateFormDialog, DataTableContainer, EditFormDialog } from '@/components/common';
import { ColumnType, CustomButton } from '@/components/custom';
import { DataImportType } from '@/enums';
import { ActionTableItem, NDataProvider } from '@/interfaces';

import { columns, filterSearch, formFields, importDataColumns } from './constants';
import { useItemPage } from './hooks';
import { ImportData, ProcessScrapeData } from './components';

const ItemPage = () => {
    const {
        openCreateItemModal,
        setOpenCreateItemModal,
        openImportItemModal,
        setOpenImportItemModal,
        editItemId,
        setEditItemId,
        selectedItemIds,
        setSelectedItemIds,
        openProcessScrapeDataModal,
        setOpenProcessScrapeDataModal,
        tableContainerData,
    } = useItemPage();

    const actionButtons: ReactNode[] = [
        <CustomButton
            type="primary"
            key="scrape-data"
            title="Cào dữ liệu"
            icon={<Icon icon="lucide:file-text" />}
            onClick={() => setOpenProcessScrapeDataModal(true)}
        >
            Cào
        </CustomButton>,
        <CustomButton
            type="primary"
            key="import-item"
            title="Nhập đối tượng"
            icon={<Icon icon="lucide:file-text" />}
            onClick={() => setOpenImportItemModal(true)}
        >
            Nhập
        </CustomButton>,
        <CustomButton
            type="primary"
            key="add-item"
            title="Thêm đối tượng"
            icon={<Icon icon="lucide:plus" />}
            onClick={() => setOpenCreateItemModal(true)}
        >
            Thêm
        </CustomButton>,
    ];

    const actionItems: ActionTableItem[] = [
        {
            key: 'edit',
            label: 'Chỉnh sửa',
            icon: <Icon icon="lucide:edit" />,
            onClick: (record) => setEditItemId(record?.id),
        },
    ];

    return (
        <>
            <DataTableContainer
                resource="items"
                columns={columns}
                title="Danh sách đối tượng"
                description="Quản lý các đối tượng được cào"
                actionButtons={actionButtons}
                actionItems={actionItems}
                tableContainerData={tableContainerData}
                filterSearch={filterSearch}
                onRowSelectionChange={(selectedRows: NDataProvider.IDataProviderItem[]) => {
                    const itemIds = selectedRows?.map((item) => item.id ?? '');
                    setSelectedItemIds(itemIds ?? []);
                }}
            />

            <CreateFormDialog
                resource="items"
                formFields={formFields}
                title="Thêm mới đối tượng"
                open={openCreateItemModal}
                onClose={() => {
                    setOpenCreateItemModal(false);
                    tableContainerData?.tableQuery?.refetch();
                }}
            />

            <EditFormDialog
                resource="items"
                id={editItemId ?? ''}
                formFields={formFields}
                title="Chỉnh sửa đối tượng"
                onClose={() => {
                    setEditItemId(undefined);
                    tableContainerData?.tableQuery?.refetch();
                }}
            />

            {openImportItemModal && (
                <ImportData
                    key="import-item"
                    open={openImportItemModal}
                    dataType={DataImportType.ITEM}
                    onClose={() => setOpenImportItemModal(false)}
                    onSuccess={() => tableContainerData?.tableQuery?.refetch()}
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
