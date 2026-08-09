'use client';

import { useMemo } from 'react';
import {
    FilterPanel,
    ListTable,
    ListWrapper,
    StatusTag,
    type IFilterField,
} from '@/components/common';
import { ColumnsType, CustomModal } from '@/components/custom-antd';
import { ScheduleJobTriggerType, ScheduleJobType, ScheduleType } from '@/enums';
import { useCustomTable } from '@/hooks';
import { NSchedule } from '@/interfaces';
import { formatDate } from '@/libs';

type ViewScheduleJobListProps = {
    isOpen: boolean;
    scheduleId: string;
    onClose: () => void;
};

export const ViewScheduleJobList = ({ isOpen, scheduleId, onClose }: ViewScheduleJobListProps) => {
    const { tableProps, tableQuery, setFilters } = useCustomTable<NSchedule.IScheduleJob>({
        resource: `schedule-jobs/schedule/${scheduleId}`,
    });

    const columns: ColumnsType<NSchedule.IScheduleJob> = [
        {
            title: 'STT',
            key: 'index',
            dataIndex: 'index',
            width: 60,
            align: 'center',
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: 'Công việc',
            dataIndex: 'scheduleType',
            key: 'scheduleType',
            width: 200,
            ellipsis: true,
            render: (scheduleType: ScheduleType) => <StatusTag status={scheduleType} />,
        },
        {
            title: 'Loại trigger',
            dataIndex: 'triggerType',
            key: 'triggerType',
            width: 200,
            ellipsis: true,
            render: (triggerType: ScheduleJobTriggerType) => <StatusTag status={triggerType} />,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 200,
            ellipsis: true,
            render: (status: ScheduleJobType) => <StatusTag status={status} />,
        },
        {
            title: 'Bắt đầu',
            dataIndex: 'startedAt',
            key: 'startedAt',
            width: 200,
            sorter: true,
            render: (startedAt: Date) => formatDate(startedAt),
        },
        {
            title: 'Kết thúc',
            dataIndex: 'finishedAt',
            key: 'finishedAt',
            width: 200,
            sorter: true,
            render: (finishedAt: Date) => formatDate(finishedAt),
        },
        {
            title: 'Lỗi',
            dataIndex: 'errorMessage',
            key: 'errorMessage',
            width: 200,
            render: (errorMessage: string) => errorMessage ?? '---',
        },
        {
            title: 'Tổng',
            dataIndex: 'eventCount',
            key: 'eventCount',
            width: 200,
            render: (eventCount: number) => eventCount ?? 0,
        },
        {
            title: 'Thất bại',
            dataIndex: 'eventFailedCount',
            key: 'eventFailedCount',
            width: 200,
            render: (eventFailedCount: number) => eventFailedCount ?? 0,
        },
        {
            title: 'Thành công',
            dataIndex: 'eventSuccessCount',
            key: 'eventSuccessCount',
            width: 200,
            render: (eventSuccessCount: number) => eventSuccessCount ?? 0,
        },
        {
            title: 'Chờ xử lý',
            dataIndex: 'eventPendingCount',
            key: 'eventPendingCount',
            width: 200,
            render: (eventPendingCount: number) => eventPendingCount ?? 0,
        },
    ];

    const filters = useMemo<IFilterField[]>(
        () => [
            {
                name: 'triggerType',
                type: 'select',
                placeholder: 'Loại trigger',
                options: [
                    { label: 'Tự động', value: ScheduleJobTriggerType.CRON },
                    { label: 'Thủ công', value: ScheduleJobTriggerType.MANUAL },
                ],
                onChange: (val) =>
                    setFilters([
                        {
                            field: 'triggerType',
                            operator: 'eq',
                            value: val,
                        },
                    ]),
            },
            {
                name: 'scheduleType',
                type: 'select',
                placeholder: 'Loại lịch biểu',
                options: [
                    { label: 'Toàn bộ', value: ScheduleType.GLOBAL },
                    { label: 'Đối tượng', value: ScheduleType.ITEM },
                    { label: 'Nhà cung cấp', value: ScheduleType.DATA_PROVIDER },
                ],
                onChange: (val) =>
                    setFilters([
                        {
                            field: 'scheduleType',
                            operator: 'eq',
                            value: val,
                        },
                    ]),
            },
        ],
        [setFilters],
    );

    return (
        <CustomModal
            modalProps={{
                width: 1200,
                open: isOpen,
                closable: true,
                centered: true,
                onCancel: onClose,
                title: 'Xem sự kiện lịch biểu thực thi',
            }}
        >
            <ListWrapper
                error={tableQuery.error}
                isLoading={tableQuery.isLoading}
                filters={<FilterPanel fields={filters} />}
            >
                <ListTable<NSchedule.IScheduleJob>
                    columns={columns}
                    tableProps={tableProps}
                    tableQuery={tableQuery}
                />
            </ListWrapper>
        </CustomModal>
    );
};
