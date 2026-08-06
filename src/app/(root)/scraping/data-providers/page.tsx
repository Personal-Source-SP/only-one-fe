'use client';

import { ReactNode } from 'react';
import { Icon } from '@iconify/react';
import { CreateFormDialog, DataTableContainer, EditFormDialog } from '@/components/common';
import { ColumnType, CustomButton } from '@/components/custom';
import { DataImportType } from '@/enums';
import { ActionTableItem, NDataProvider } from '@/interfaces';

import {
    columns,
    customFilterItems,
    filterSearch,
    getFormFields,
    importDataColumns,
} from './constants';
import { useDataProviderPage } from './hooks';
import { ImportData, ProcessScrapeData, ScrapeSetting } from './components';

const DataProviderPage = () => {
    const {
        openCreateItemModal,
        setOpenCreateItemModal,
        openImportItemModal,
        setOpenImportItemModal,
        editItemId,
        setEditItemId,
        openProcessScrapeDataModal,
        setOpenProcessScrapeDataModal,
        selectedDataProviderIds,
        tableContainerData,
        modalPropsData,
        dataProviders,
        dataProviderQuery,
    } = useDataProviderPage();

    const formFields = getFormFields(dataProviders ?? [], dataProviderQuery);

    const actionItems: ActionTableItem[] = [
        {
            key: 'edit',
            label: 'Chỉnh sửa',
            icon: <Icon icon="tabler:edit" />,
            onClick: (record: NDataProvider.IDataProvider) => setEditItemId(record?.id),
        },
        {
            key: 'scrape-unconfigured',
            label: 'Cấu hình dữ liệu',
            icon: <Icon icon="tabler:database-cog" />,
            onClick: (record: NDataProvider.IDataProvider) => {
                modalPropsData?.show?.(record?.id);
            },
        },
        {
            key: 'search-configured',
            label: 'Cấu hình tìm kiếm',
            icon: <Icon icon="tabler:search" />,
            onClick: (record: NDataProvider.IDataProvider) => {
                modalPropsData?.show?.(record?.id);
            },
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
            title="Nhập nhà cung cấp"
            key="import-data-provider"
            icon={<Icon icon="lucide:import" />}
            onClick={() => setOpenImportItemModal(true)}
        >
            Nhập
        </CustomButton>,
        <CustomButton
            type="primary"
            key="add-data-provider"
            title="Thêm nhà cung cấp"
            icon={<Icon icon="lucide:plus" />}
            onClick={() => setOpenCreateItemModal(true)}
        >
            Thêm
        </CustomButton>,
    ];

    return (
        <>
            <DataTableContainer
                columns={columns}
                resource="data-providers"
                actionItems={actionItems}
                title="Danh sách nhà cung cấp"
                actionButtons={actionButtons}
                customFilterItems={customFilterItems}
                tableContainerData={tableContainerData}
                filterSearch={filterSearch}
                description="Danh sách nhà cung cấp được sử dụng để cào dữ liệu và tìm kiếm dữ liệu"
            />

            <CreateFormDialog
                resource="data-providers"
                formFields={formFields}
                title="Thêm mới đối tượng"
                open={openCreateItemModal}
                onClose={() => {
                    setOpenCreateItemModal(false);
                    tableContainerData?.tableQuery?.refetch();
                }}
            />

            <EditFormDialog
                resource="data-providers"
                id={editItemId ?? ''}
                formFields={formFields}
                title="Chỉnh sửa đối tượng"
                onClose={() => {
                    setEditItemId(undefined);
                    tableContainerData?.tableQuery?.refetch();
                }}
            />

            <ScrapeSetting
                key="scrape-setting"
                modalPropsData={modalPropsData}
                onClose={() => {
                    modalPropsData?.close();
                    tableContainerData?.tableQuery?.refetch();
                }}
            />

            {openProcessScrapeDataModal && (
                <ProcessScrapeData
                    key="process-scrape-data"
                    open={openProcessScrapeDataModal}
                    selectedItemIds={selectedDataProviderIds}
                    onClose={() => {
                        setOpenProcessScrapeDataModal(false);
                    }}
                />
            )}

            {openImportItemModal && (
                <ImportData
                    key="import-data-provider"
                    open={openImportItemModal}
                    dataType={DataImportType.DATA_PROVIDER}
                    onClose={() => setOpenImportItemModal(false)}
                    onSuccess={() => tableContainerData?.tableQuery?.refetch()}
                    columns={importDataColumns as unknown as ColumnType<Record<string, any>>[]}
                />
            )}
        </>
    );
};

export default DataProviderPage;
