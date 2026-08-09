'use client';

import { ColumnsType } from '@/components/custom-antd';
import {
    FilterPanel,
    ListTable,
    ListWrapper,
    StatusTag,
    type IFilterField,
} from '@/components/common';
import { ScheduleJobEventType } from '@/enums';
import type { NSchedule } from '@/interfaces';
import { formatDate } from '@/libs';

import { useScheduleJobEventsPage } from './hooks';
import { ViewJobEvent } from './components';
import type { JobEventRecord } from './types';

const ScheduleJobEventsPage = () => {
    const { tableProps, tableQuery, debouncedSearch, selectedJobEvent, setSelectedJobEvent } =
        useScheduleJobEventsPage();

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

    const filters: IFilterField[] = [
        {
            name: 'search',
            type: 'input',
            placeholder: 'Tìm kiếm sự kiện lịch biểu...',
            onChange: (value) => debouncedSearch(value?.toString() ?? ''),
        },
    ];

    return (
        <>
            <ListWrapper
                error={tableQuery.error}
                isLoading={tableQuery.isLoading}
                filters={<FilterPanel fields={filters} />}
            >
                <ListTable<JobEventRecord>
                    columns={columns}
                    tableProps={tableProps}
                    tableQuery={tableQuery}
                    onView={(record) => setSelectedJobEvent(record)}
                />
            </ListWrapper>

            {!!selectedJobEvent && (
                <ViewJobEvent
                    isOpen={true}
                    jobEvent={selectedJobEvent}
                    onClose={() => setSelectedJobEvent(undefined)}
                />
            )}
        </>
    );
};

export default ScheduleJobEventsPage;
