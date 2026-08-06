'use client';

import { ReactNode } from 'react';
import { Icon } from '@iconify/react';
import { CreateFormDialog, DataTableContainer, EditFormDialog } from '@/components/common';
import { CustomButton } from '@/components/custom';
import { ActionTableItem } from '@/interfaces';

import { columns, filterSearch, formFields, initialValues } from './constants';
import { useCloudDataProviderPage } from './hooks';

const CloudDataProvider = () => {
    const {
        openCreateItemModal,
        setOpenCreateItemModal,
        editItemId,
        setEditItemId,
        tableContainerData,
    } = useCloudDataProviderPage();

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
            title="Thêm nhà cung cấp"
            key="add-cloud-data-provider"
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
                actionItems={actionItems}
                resource="cloud-data-providers"
                title="Danh sách nhà cung cấp cloud"
                description="Quản lý các nhà cung cấp dịch vụ cloud"
                actionButtons={actionButtons}
                tableContainerData={tableContainerData}
                filterSearch={filterSearch}
            />

            <CreateFormDialog
                formFields={formFields}
                open={openCreateItemModal}
                title="Thêm mới nhà cung cấp"
                resource="cloud-data-providers"
                initialValues={initialValues}
                onClose={() => {
                    setOpenCreateItemModal(false);
                    tableContainerData?.tableQuery?.refetch();
                }}
                onTransformValues={(values) => {
                    return {
                        ...values,
                        config: JSON.parse(values.config),
                    };
                }}
            />

            <EditFormDialog
                id={editItemId ?? ''}
                formFields={formFields}
                resource="cloud-data-providers"
                title="Chỉnh sửa nhà cung cấp"
                onClose={() => {
                    setEditItemId(undefined);
                    tableContainerData?.tableQuery?.refetch();
                }}
            />
        </>
    );
};

export default CloudDataProvider;
