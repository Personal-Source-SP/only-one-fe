'use client';

import { ReactNode } from 'react';
import { Icon } from '@iconify/react';
import { CreateFormDialog, DataTableContainer, EditFormDialog } from '@/components/common';
import { CustomButton } from '@/components/custom';
import { ActionTableItem } from '@/interfaces';

import { filterSearch, getColumns, getFormFields, initialValues } from './constants';
import { useScheduleExecutionPage } from './hooks';
import { NextRunTimes, ViewScheduleJobList } from './components';

const ScheduleExecutionPage = () => {
    const {
        loading,
        openCreateItemModal,
        setOpenCreateItemModal,
        editItemId,
        setEditItemId,
        type,
        setType,
        cronExpression,
        setCronExpression,
        selectedScheduleId,
        setSelectedScheduleId,
        itemOptions,
        dataProviderOptions,
        tableContainerData,
        handleSwitchStatus,
        handleManualTrigger,
    } = useScheduleExecutionPage();

    const columns = getColumns(handleSwitchStatus);
    const formFields = getFormFields(
        type,
        setType,
        setCronExpression,
        dataProviderOptions ?? [],
        itemOptions ?? [],
    );

    const actionItems: ActionTableItem[] = [
        {
            key: 'edit',
            label: 'Chỉnh sửa',
            icon: <Icon icon="lucide:edit" />,
            onClick: (record) => setEditItemId(record?.id),
        },
        {
            key: 'manual-trigger',
            label: 'Chạy thủ công',
            icon: <Icon icon="lucide:play" />,
            onClick: (record) => handleManualTrigger(record?.id),
        },
        {
            key: 'view-schedule-job-list',
            label: 'Xem danh sách công việc',
            icon: <Icon icon="lucide:list" />,
            onClick: (record) => setSelectedScheduleId(record?.id),
        },
    ];

    const actionButtons: ReactNode[] = [
        <CustomButton
            type="primary"
            key="add-schedule-execution"
            title="Thêm lịch biểu thực thi"
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
                resource="schedules"
                actionItems={actionItems}
                title="Danh sách lịch biểu thực thi"
                description="Quản lý các lịch biểu thực thi công việc"
                actionButtons={actionButtons}
                tableContainerData={tableContainerData}
                filterSearch={filterSearch}
            />

            <CreateFormDialog
                resource="schedules"
                formFields={formFields}
                open={openCreateItemModal}
                title="Thêm mới lịch biểu thực thi"
                bottomRender={<NextRunTimes cron={cronExpression} />}
                initialValues={initialValues}
                onClose={() => {
                    setOpenCreateItemModal(false);
                    tableContainerData?.tableQuery?.refetch();
                }}
            />

            <EditFormDialog
                resource="schedules"
                id={editItemId ?? ''}
                formFields={formFields}
                title="Chỉnh sửa lịch biểu thực thi"
                onClose={() => {
                    setEditItemId(undefined);
                    tableContainerData?.tableQuery?.refetch();
                }}
            />

            {!!selectedScheduleId && (
                <ViewScheduleJobList
                    isOpen
                    scheduleId={selectedScheduleId}
                    onClose={() => setSelectedScheduleId(undefined)}
                />
            )}
        </>
    );
};

export default ScheduleExecutionPage;
