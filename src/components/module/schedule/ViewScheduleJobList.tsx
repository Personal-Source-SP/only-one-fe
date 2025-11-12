'use client';

import { StatusTag } from '@/components/common';
import { CustomModal, TableContainer } from '@/components/custom';
import { CustomFilterType, ScheduleJobTriggerType, ScheduleJobType, ScheduleType } from '@/enums';
import { useTableContainer } from '@/hooks';
import { FilterItem, NSchedule } from '@/interfaces';
import { formatDate } from '@/libs';
import { ColumnsType } from 'antd/es/table';
import { FC, memo } from 'react';

type ViewScheduleJobListProps = {
    isOpen: boolean;
    scheduleId: string;
    onClose: () => void;
};

const ViewScheduleJobList: FC<ViewScheduleJobListProps> = ({ isOpen, scheduleId, onClose }) => {
    const tableContainerData = useTableContainer({
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

    const customFilterItems: FilterItem[] = [
        {
            span: 12,
            allowClear: true,
            field: 'triggerType',
            title: 'Loại trigger',
            type: CustomFilterType.SELECT,
            options: [
                { label: 'Tự động', value: ScheduleJobTriggerType.CRON },
                { label: 'Thủ công', value: ScheduleJobTriggerType.MANUAL },
            ],
        },
        {
            span: 12,
            allowClear: true,
            title: 'Loại lịch biểu',
            field: 'scheduleType',
            type: CustomFilterType.SELECT,
            options: [
                { label: 'Toàn bộ', value: ScheduleType.GLOBAL },
                { label: 'Đối tượng', value: ScheduleType.ITEM },
                { label: 'Nhà cung cấp', value: ScheduleType.DATA_PROVIDER },
            ],
        },
    ];

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
            <TableContainer
                columns={columns}
                customFilterItems={customFilterItems}
                tableContainerData={tableContainerData}
                loading={tableContainerData.tableQuery.isLoading}
            />
        </CustomModal>
    );
};

export default memo(ViewScheduleJobList);
