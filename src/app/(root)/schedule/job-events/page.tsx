'use client';

import { CustomElement, TableContainer } from '@/components/custom';
import { ViewJobEvent } from '@/components/module/schedule';
import { ElementType, ScheduleJobEventType } from '@/enums';
import { useTableContainer } from '@/hooks';
import { ActionTableItem, NSchedule } from '@/interfaces';
import { Icon } from '@iconify/react/dist/iconify.js';
import { Space } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { FC, useState } from 'react';

const ScheduleJobEventsPage: FC = () => {
    const [selectedJobEvent, setSelectedJobEvent] = useState<
        NSchedule.IScheduleJobEvent | undefined
    >(undefined);

    const tableContainerData = useTableContainer({
        resource: 'schedule-job-events',
    });

    const columns: ColumnsType<NSchedule.IScheduleJobEvent> = [
        {
            title: 'Loại sự kiện',
            dataIndex: 'eventType',
            key: 'eventType',
            width: 150,
            ellipsis: true,
            render: (type: ScheduleJobEventType) => {
                switch (type) {
                    case ScheduleJobEventType.PENDING:
                        return 'Nhà cung cấp';
                    case ScheduleJobEventType.PROCESSING:
                        return 'Đang xử lý';
                    case ScheduleJobEventType.COMPLETED:
                        return 'Hoàn thành';
                    case ScheduleJobEventType.FAILED:
                        return 'Thất bại';
                }
            },
        },
        {
            title: 'Nội dung sự kiện',
            dataIndex: 'eventMessage',
            key: 'eventMessage',
            width: 150,
            ellipsis: true,
            render: (eventMessage: string) => eventMessage ?? '---',
        },
        {
            title: 'Bắt đầu',
            dataIndex: 'startedAt',
            key: 'startedAt',
            width: 200,
            sorter: true,
            render: (startedAt: Date) =>
                startedAt ? dayjs(startedAt).format('DD/MM/YYYY HH:mm:ss') : '---',
        },
        {
            title: 'Kết thúc',
            dataIndex: 'finishedAt',
            key: 'finishedAt',
            width: 200,
            sorter: true,
            render: (finishedAt: Date) =>
                finishedAt ? dayjs(finishedAt).format('DD/MM/YYYY HH:mm:ss') : '---',
        },
        {
            title: 'Số lần thử',
            dataIndex: 'retryCount',
            key: 'retryCount',
            width: 100,
            render: (retryCount: number) => retryCount ?? 0,
        },
    ];

    const actionItems: ActionTableItem[] = [
        {
            key: 'view',
            label: 'Xem',
            icon: <Icon icon="lucide:eye" />,
            onClick: (record) => {
                setSelectedJobEvent(record);
            },
        },
    ];

    return (
        <Space size="middle" direction="vertical" className="w-full h-full">
            <CustomElement
                elementType={ElementType.TITLE}
                title="Danh sách sự kiện lịch biểu thực thi"
            />

            <TableContainer
                columns={columns}
                actionItems={actionItems}
                tableContainerData={tableContainerData}
                filterSearch={{ placeholder: 'Tìm kiếm sự kiện lịch biểu thực thi' }}
            />

            {!!selectedJobEvent && (
                <ViewJobEvent
                    isOpen={true}
                    jobEvent={selectedJobEvent}
                    onClose={() => setSelectedJobEvent(undefined)}
                />
            )}
        </Space>
    );
};

export default ScheduleJobEventsPage;
