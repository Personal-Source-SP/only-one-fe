'use client';

import { ListContainer, ListTable, StatusTag, type IFilterField } from '@/components/common';
import { ColumnsType } from '@/components/custom-antd';
import { formatDate } from '@/libs';
import { ViewJobEvent } from './components';
import { ScheduleJobEventType } from './enums';
import { useScheduleJobEventsPage } from './hooks';
import type { JobEventRecord } from './types';

export default function ScheduleJobEventsPage() {
    const { table, debouncedSearch, selectedJobEvent, setSelectedJobEvent } =
        useScheduleJobEventsPage();

    const columns: ColumnsType<JobEventRecord> = [
        {
            title: 'STT',
            key: 'index',
            dataIndex: 'index',
            width: 60,
            align: 'center',
            render: (_: unknown, __: unknown, index: number) => index + 1,
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

    const filters: IFilterField[] = [
        {
            name: 'search',
            type: 'input',
            isPrimary: true,
            placeholder: 'Tìm kiếm sự kiện lịch biểu...',
            onChange: (value) => debouncedSearch(value?.toString() ?? ''),
        },
    ];

    return (
        <>
            <ListContainer isLoading={table.tableQuery.isLoading} filters={filters}>
                <ListTable<JobEventRecord>
                    columns={columns}
                    table={table}
                    onView={(record) => setSelectedJobEvent(record)}
                />
            </ListContainer>

            {!!selectedJobEvent && (
                <ViewJobEvent
                    isOpen={true}
                    jobEvent={selectedJobEvent}
                    onClose={() => setSelectedJobEvent(undefined)}
                />
            )}
        </>
    );
}
