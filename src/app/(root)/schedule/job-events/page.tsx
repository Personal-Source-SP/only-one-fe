'use client';

import { ColumnsType, CustomSpace, TableContainer } from '@/components/custom';
import { StatusTag } from '@/components/common';
import { ViewJobEvent } from '@/components/module/schedule';
import { ScheduleJobEventType } from '@/enums';
import { useTableContainer } from '@/hooks';
import { ActionTableItem, NSchedule } from '@/interfaces';
import { formatDate } from '@/libs';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useState } from 'react';

const ScheduleJobEventsPage = () => {
    const [selectedJobEvent, setSelectedJobEvent] = useState<
        NSchedule.IScheduleJobEvent | undefined
    >(undefined);

    const tableContainerData = useTableContainer({
        resource: 'schedule-job-events',
    });

    const columns: ColumnsType<NSchedule.IScheduleJobEvent> = [
        {
            title: 'STT',
            key: 'index',
            dataIndex: 'index',
            width: 60,
            align: 'center',
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: 'Loại sự kiện',
            dataIndex: 'eventType',
            key: 'eventType',
            width: 150,
            ellipsis: true,
            render: (type: ScheduleJobEventType) => <StatusTag status={type} />,
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
            title: 'Số lần thử',
            dataIndex: 'retryCount',
            key: 'retryCount',
            width: 100,
            align: 'center',
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
        <CustomSpace size="middle" direction="vertical" className="w-full h-full">
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
        </CustomSpace>
    );
};

export default ScheduleJobEventsPage;
