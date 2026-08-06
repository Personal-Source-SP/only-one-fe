'use client';

import { ReactNode } from 'react';
import { Icon } from '@iconify/react';
import { CreateFormDialog, DataTableContainer } from '@/components/common';
import { CustomButton } from '@/components/custom';

import { columns, filterSearch, getCreateFormFields } from './constants';
import { useCloudDataItemPage } from './hooks';

const CloudDataItem = () => {
    const {
        openCreateItemModal,
        setOpenCreateItemModal,
        tableContainerData,
        cloudDataProviderOptions,
    } = useCloudDataItemPage();

    const createFormFields = getCreateFormFields(cloudDataProviderOptions ?? []);

    const actionButtons: ReactNode[] = [
        <CustomButton
            type="primary"
            title="Thêm dữ liệu"
            key="add-cloud-data-item"
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
                resource="cloud-data-items"
                title="Danh sách dữ liệu cloud"
                description="Xem và quản lý dữ liệu trên cloud"
                actionButtons={actionButtons}
                tableContainerData={tableContainerData}
                filterSearch={filterSearch}
            />

            <CreateFormDialog
                open={openCreateItemModal}
                formFields={createFormFields}
                title="Thêm mới dữ liệu đám mây"
                resource="cloud-data-items/upload"
                onClose={() => {
                    setOpenCreateItemModal(false);
                    tableContainerData?.tableQuery?.refetch();
                }}
                onTransformValues={(values) => {
                    const fileList = values.file as any[];
                    if (!fileList?.length || !fileList[0]?.originFileObj) {
                        return values;
                    }

                    const formData = new FormData();
                    formData.append('file', fileList[0].originFileObj);
                    formData.append('cloudDataProviderId', values.cloudDataProviderId);

                    return formData;
                }}
            />
        </>
    );
};

export default CloudDataItem;
