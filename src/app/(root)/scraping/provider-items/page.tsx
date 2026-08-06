'use client';

import { ReactNode } from 'react';
import { Icon } from '@iconify/react';
import { CreateFormDialog, DataTableContainer, EditFormDialog } from '@/components/common';
import { CustomButton } from '@/components/custom';
import { DataProviderStatus } from '@/enums';
import { ActionTableItem, NDataProvider } from '@/interfaces';

import {
    createFormInitialValues,
    filterSearch,
    getColumns,
    getCustomFilterItems,
    getFormFields,
} from './constants';
import { useDataProviderItemPage } from './hooks';
import { ProcessScrapeData } from './components';

const DataProviderItemPage = () => {
    const {
        loading,
        openCreateItemModal,
        setOpenCreateItemModal,
        editItemId,
        setEditItemId,
        openProcessScrapeDataModal,
        setOpenProcessScrapeDataModal,
        selectedDataProviderItemIds,
        setSelectedDataProviderItemIds,
        itemOptions,
        cloudDataProviderOptions,
        dataProviderOptions,
        dataProviderQuery,
        tableContainerData,
        handleSwitchStatus,
    } = useDataProviderItemPage();

    const columns = getColumns(handleSwitchStatus);
    const formFields = getFormFields(
        itemOptions ?? [],
        cloudDataProviderOptions ?? [],
        dataProviderOptions ?? [],
        dataProviderQuery,
    );
    const customFilterItems = getCustomFilterItems(dataProviderOptions ?? [], itemOptions ?? []);

    const actionItems: ActionTableItem[] = [
        {
            key: 'edit',
            label: 'Chỉnh sửa',
            icon: <Icon icon="lucide:edit" />,
            onClick: (record) => setEditItemId(record?.id),
        },
    ];

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
            key="add-data-provider-item"
            title="Thêm đối tượng nhà cung cấp"
            icon={<Icon icon="lucide:plus" />}
            onClick={() => setOpenCreateItemModal(true)}
        >
            Thêm
        </CustomButton>,
    ];

    return (
        <>
            <DataTableContainer
                loading={loading}
                columns={columns}
                actionItems={actionItems}
                resource="data-provider-items"
                title="Danh sách đối tượng nhà cung cấp"
                description="Quản lý các đối tượng thuộc nhà cung cấp"
                actionButtons={actionButtons}
                customFilterItems={customFilterItems}
                tableContainerData={tableContainerData}
                filterSearch={filterSearch}
                onRowSelectionChange={(selectedRows: NDataProvider.IDataProviderItem[]) => {
                    const dataProviderItemsIds = selectedRows
                        ?.filter((item) => item.dataProvider?.status === DataProviderStatus.READY)
                        ?.map((item) => item.id ?? '');

                    setSelectedDataProviderItemIds(dataProviderItemsIds ?? []);
                }}
                onDisableRowSelection={(record: NDataProvider.IDataProviderItem) =>
                    record.dataProvider?.status !== DataProviderStatus.READY || !record.isActive
                }
            />

            <CreateFormDialog
                formFields={formFields}
                open={openCreateItemModal}
                resource="data-provider-items"
                title="Thêm mới đối tượng nhà cung cấp"
                initialValues={createFormInitialValues}
                onClose={() => {
                    setOpenCreateItemModal(false);
                    tableContainerData?.tableQuery?.refetch();
                }}
            />

            <EditFormDialog
                id={editItemId ?? ''}
                formFields={formFields}
                resource="data-provider-items"
                title="Chỉnh sửa đối tượng nhà cung cấp"
                onClose={() => {
                    setEditItemId(undefined);
                    tableContainerData?.tableQuery?.refetch();
                }}
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
