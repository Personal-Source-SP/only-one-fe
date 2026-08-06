'use client';

import { ReactNode } from 'react';
import { Icon } from '@iconify/react';
import { CreateFormDialog, DataTableContainer, EditFormDialog } from '@/components/common';
import { CustomButton } from '@/components/custom';
import { SimulationItemStatus } from '@/enums';
import { ActionTableItem } from '@/interfaces';

import { columns, filterSearch, getFormFields, initialValues } from './constants';
import { useSimulationItemsPage } from './hooks';

const SimulationItemsPage = () => {
    const {
        loading,
        openCreateItemModal,
        setOpenCreateItemModal,
        editItemId,
        setEditItemId,
        simulationContextOptions,
        simulationContextQuery,
        tableContainerData,
        handleSimulationItemAction,
    } = useSimulationItemsPage();

    const formFields = getFormFields(simulationContextOptions ?? [], simulationContextQuery);

    const actionItems: ActionTableItem[] = [
        {
            key: 'start',
            label: 'Start',
            icon: <Icon icon="lucide:play" />,
            onClick: (record) =>
                handleSimulationItemAction(record?.id, SimulationItemStatus.PROCESSING),
        },
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
            title="Thêm mô phỏng"
            key="add-simulation-item"
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
                resource="simulation-items"
                title="Danh sách đối tượng mô phỏng"
                description="Quản lý các đối tượng mô phỏng"
                actionButtons={actionButtons}
                tableContainerData={tableContainerData}
                filterSearch={filterSearch}
            />

            <CreateFormDialog
                formFields={formFields}
                open={openCreateItemModal}
                title="Thêm mới mô phỏng"
                resource="simulation-items"
                onClose={() => {
                    setOpenCreateItemModal(false);
                    tableContainerData?.tableQuery?.refetch();
                }}
                initialValues={initialValues}
                onTransformValues={(values) => {
                    try {
                        return {
                            ...values,
                            payload: JSON.parse(values.payload),
                        };
                    } catch {
                        return values;
                    }
                }}
            />

            <EditFormDialog
                id={editItemId ?? ''}
                formFields={formFields}
                title="Chỉnh sửa mô phỏng"
                resource="simulation-items"
                onClose={() => {
                    setEditItemId(undefined);
                    tableContainerData?.tableQuery?.refetch();
                }}
            />
        </>
    );
};

export default SimulationItemsPage;
