'use client';

import { ReactNode } from 'react';
import { Icon } from '@iconify/react';
import { CreateFormDialog, DataTableContainer, EditFormDialog } from '@/components/common';
import { CustomButton } from '@/components/custom';
import { ActionTableItem } from '@/interfaces';

import { columns, filterSearch, formFields, initialValues } from './constants';
import { useSimulationContextsPage } from './hooks';

const SimulationContextsPage = () => {
    const {
        loading,
        openCreateItemModal,
        setOpenCreateItemModal,
        editItemId,
        setEditItemId,
        tableContainerData,
        handleCreateSimulationItem,
    } = useSimulationContextsPage();

    const actionItems: ActionTableItem[] = [
        {
            key: 'edit',
            label: 'Chỉnh sửa',
            icon: <Icon icon="lucide:edit" />,
            onClick: (record) => setEditItemId(record?.id),
        },
        {
            key: 'create-simulation-items',
            label: 'Tạo mô phỏng',
            icon: <Icon icon="lucide:plus" />,
            onClick: (record) => handleCreateSimulationItem(record?.id),
        },
    ];

    const actionButtons: ReactNode[] = [
        <CustomButton
            type="primary"
            title="Thêm ngữ cảnh mô phỏng"
            key="add-simulation-context"
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
                resource="simulation-contexts"
                title="Danh sách ngữ cảnh mô phỏng"
                description="Quản lý các ngữ cảnh mô phỏng"
                actionButtons={actionButtons}
                tableContainerData={tableContainerData}
                filterSearch={filterSearch}
            />

            <CreateFormDialog
                formFields={formFields}
                open={openCreateItemModal}
                resource="simulation-contexts"
                title="Thêm mới ngữ cảnh mô phỏng"
                onClose={() => {
                    setOpenCreateItemModal(false);
                    tableContainerData?.tableQuery?.refetch();
                }}
                initialValues={initialValues}
                onTransformValues={(values) => {
                    try {
                        return {
                            ...values,
                            defaultPayload: JSON.parse(values.defaultPayload),
                        };
                    } catch {
                        return values;
                    }
                }}
            />

            <EditFormDialog
                id={editItemId ?? ''}
                formFields={formFields}
                resource="simulation-contexts"
                title="Chỉnh sửa ngữ cảnh mô phỏng"
                onClose={() => {
                    setEditItemId(undefined);
                    tableContainerData?.tableQuery?.refetch();
                }}
            />
        </>
    );
};

export default SimulationContextsPage;
