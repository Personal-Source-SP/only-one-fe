'use client';

import { PlusOutlined } from '@ant-design/icons';
import { ColumnsType, CustomButton, CustomToggle } from '@/components/custom-antd';
import {
    FilterPanel,
    ListTable,
    ListWrapper,
    StatusTag,
    type CardAction,
    type IFilterField,
} from '@/components/common';
import { CronExpression, ExecutionServiceEnum, ScheduleType } from '@/enums';
import { capitalizeFirstLetter, formatDate, getEnumKeyByValue } from '@/libs';
import { RESOURCE } from '@/config';

import { useScheduleExecutionPage } from './hooks';
import { ScheduleExecutionFormModal, ViewScheduleJobList } from './components';
import type { ScheduleExecutionRecord } from './types';

const ScheduleExecutionPage = () => {
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
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: 'Loại dịch vụ',
            dataIndex: 'executionService',
            key: 'executionService',
            width: 150,
            ellipsis: true,
            render: (executionService: ExecutionServiceEnum) => (
                <StatusTag status={executionService} />
            ),
        },
        {
            title: 'Loại lịch biểu',
            dataIndex: 'type',
            key: 'type',
            width: 150,
            ellipsis: true,
            render: (type: ScheduleType) => <StatusTag status={type} />,
        },
        {
            title: 'Lịch biểu cron',
            dataIndex: 'cronExpression',
            key: 'cronExpression',
            width: 150,
            ellipsis: true,
            render: (value: string) =>
                capitalizeFirstLetter(getEnumKeyByValue(CronExpression, value) ?? '---'),
        },
        {
            title: 'Chạy gần nhất',
            dataIndex: 'nextRunAt',
            key: 'nextRunAt',
            width: 400,
            sorter: true,
            render: (nextRunAt: Date) => formatDate(nextRunAt),
        },
        {
            title: 'Chạy cuối cùng',
            dataIndex: 'lastRunAt',
            key: 'lastRunAt',
            width: 400,
            sorter: true,
            render: (lastRunAt: Date) => formatDate(lastRunAt),
        },
        {
            title: 'Công việc',
            dataIndex: 'jobCount',
            key: 'jobCount',
            width: 200,
            align: 'center',
            render: (jobCount: number) => jobCount ?? 0,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 200,
            align: 'center',
            render: (isActive: boolean, record: ScheduleExecutionRecord) => (
                <CustomToggle
                    size="small"
                    checked={isActive}
                    onChange={(checked) => handleSwitchStatus(record?.id ?? '', checked)}
                />
            ),
        },
    ];

    const actions: CardAction[] = [
        {
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
            placeholder: 'Tìm kiếm lịch biểu...',
            onChange: (value) => debouncedSearch(value?.toString() ?? ''),
        },
    ];

    return (
        <>
            <ListWrapper
                actions={actions}
                error={tableQuery.error}
                isLoading={loading || tableQuery.isLoading}
                filters={<FilterPanel fields={filters} />}
            >
                <ListTable<ScheduleExecutionRecord>
                    columns={columns}
                    tableProps={tableProps}
                    tableQuery={tableQuery}
                    deleteResource={RESOURCE.SCHEDULES}
                    onEdit={(record) => editModalForm.show(record.id)}
                />
            </ListWrapper>

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
};

export default ScheduleExecutionPage;
