'use client';

import { ListContainer, StatusTag, type ICardAction, type IFilterField } from '@/components/common';
import { ColumnsType, CustomButton, CustomToggle } from '@/components/custom-antd';
import { RESOURCE } from '@/config';
import { capitalizeFirstLetter, formatDate, getEnumKeyByValue } from '@/libs';
import { PlusOutlined } from '@ant-design/icons';
import { ScheduleExecutionFormModal, ViewScheduleJobList } from './components';
import { EXECUTION_FIELDS } from './constants';
import { CronExpression, ExecutionServiceEnum, ScheduleType } from './enums';
import { useScheduleExecutionPage } from './hooks';
import type { ScheduleExecutionRecord } from './types';

export default function ScheduleExecutionPage() {
    const {
        loading,
        tableProps,
        tableQuery,
        debouncedSearch,
        createModalForm,
        editModalForm,
        selectedScheduleId,
        setSelectedScheduleId,
        itemOptions,
        dataProviderOptions,
        handleSwitchStatus,
    } = useScheduleExecutionPage();

    const columns: ColumnsType<ScheduleExecutionRecord> = [
        {
            title: 'STT',
            key: 'index',
            dataIndex: 'index',
            width: 60,
            align: 'center',
            render: (_: unknown, __: unknown, index: number) => index + 1,
        },
        {
            dataIndex: EXECUTION_FIELDS.EXECUTION_SERVICE.key,
            key: EXECUTION_FIELDS.EXECUTION_SERVICE.key,
            ...EXECUTION_FIELDS.EXECUTION_SERVICE.table,
            render: (executionService: ExecutionServiceEnum) => (
                <StatusTag status={executionService} />
            ),
        },
        {
            dataIndex: EXECUTION_FIELDS.TYPE.key,
            key: EXECUTION_FIELDS.TYPE.key,
            ...EXECUTION_FIELDS.TYPE.table,
            render: (type: ScheduleType) => <StatusTag status={type} />,
        },
        {
            dataIndex: EXECUTION_FIELDS.CRON_EXPRESSION.key,
            key: EXECUTION_FIELDS.CRON_EXPRESSION.key,
            ...EXECUTION_FIELDS.CRON_EXPRESSION.table,
            render: (value: string) =>
                capitalizeFirstLetter(getEnumKeyByValue(CronExpression, value) ?? '---'),
        },
        {
            dataIndex: EXECUTION_FIELDS.NEXT_RUN_AT.key,
            key: EXECUTION_FIELDS.NEXT_RUN_AT.key,
            ...EXECUTION_FIELDS.NEXT_RUN_AT.table,
            render: (nextRunAt: Date) => formatDate(nextRunAt),
        },
        {
            dataIndex: EXECUTION_FIELDS.LAST_RUN_AT.key,
            key: EXECUTION_FIELDS.LAST_RUN_AT.key,
            ...EXECUTION_FIELDS.LAST_RUN_AT.table,
            render: (lastRunAt: Date) => formatDate(lastRunAt),
        },
        {
            dataIndex: EXECUTION_FIELDS.JOB_COUNT.key,
            key: EXECUTION_FIELDS.JOB_COUNT.key,
            ...EXECUTION_FIELDS.JOB_COUNT.table,
            render: (jobCount: number) => jobCount ?? 0,
        },
        {
            dataIndex: EXECUTION_FIELDS.IS_ACTIVE.key,
            key: EXECUTION_FIELDS.IS_ACTIVE.key,
            ...EXECUTION_FIELDS.IS_ACTIVE.table,
            render: (isActive: boolean, record: ScheduleExecutionRecord) => (
                <CustomToggle
                    size="small"
                    checked={isActive}
                    onChange={(checked) => handleSwitchStatus(record?.id ?? '', checked)}
                />
            ),
        },
    ];

    const actions: ICardAction[] = [
        {
            label: 'Thêm lịch biểu thực thi',
            icon: <PlusOutlined />,
            permissionAction: 'create',
            component: (
                <CustomButton
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => createModalForm.show()}
                >
                    Thêm lịch biểu thực thi
                </CustomButton>
            ),
        },
    ];

    const filters: IFilterField[] = [
        {
            name: 'search',
            type: 'input',
            isPrimary: true,
            placeholder: 'Tìm kiếm lịch biểu...',
            onChange: (value) => debouncedSearch(value?.toString() ?? ''),
        },
    ];

    return (
        <>
            <ListContainer
                actions={actions}
                isLoading={loading || tableQuery.isLoading}
                filters={filters}
                table={{
                    columns,
                    tableProps,
                    tableQuery,
                    deleteResource: RESOURCE.SCHEDULES,
                    onEdit: (record) => editModalForm.show(record.id),
                }}
            />

            <ScheduleExecutionFormModal
                modalForm={createModalForm}
                itemOptions={itemOptions ?? []}
                dataProviderOptions={dataProviderOptions ?? []}
            />

            <ScheduleExecutionFormModal
                modalForm={editModalForm}
                itemOptions={itemOptions ?? []}
                dataProviderOptions={dataProviderOptions ?? []}
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
}
