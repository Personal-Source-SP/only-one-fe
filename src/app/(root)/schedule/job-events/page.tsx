'use client';

import { ListContainer, ListTable, StatusTag, type IFilterField } from '@/components/common';
import { ColumnsType } from '@/components/custom-antd';
import { formatDate } from '@/libs';
import { ViewJobEvent } from './components';
import { JOB_EVENT_FIELDS } from './constants';
import { ScheduleJobEventType } from './enums';
import { useScheduleJobEventsPage } from './hooks';
import type { JobEventRecord } from './types';

export default function ScheduleJobEventsPage() {
    const { tableProps, tableQuery, debouncedSearch, selectedJobEvent, setSelectedJobEvent } =
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
            dataIndex: JOB_EVENT_FIELDS.EVENT_TYPE.key,
            key: JOB_EVENT_FIELDS.EVENT_TYPE.key,
            ...JOB_EVENT_FIELDS.EVENT_TYPE.table,
            render: (type: ScheduleJobEventType) => <StatusTag status={type} />,
        },
        {
            dataIndex: JOB_EVENT_FIELDS.EVENT_MESSAGE.key,
            key: JOB_EVENT_FIELDS.EVENT_MESSAGE.key,
            ...JOB_EVENT_FIELDS.EVENT_MESSAGE.table,
            render: (eventMessage: string) => eventMessage ?? '---',
        },
        {
            dataIndex: JOB_EVENT_FIELDS.STARTED_AT.key,
            key: JOB_EVENT_FIELDS.STARTED_AT.key,
            ...JOB_EVENT_FIELDS.STARTED_AT.table,
            render: (startedAt: Date) => formatDate(startedAt),
        },
        {
            dataIndex: JOB_EVENT_FIELDS.FINISHED_AT.key,
            key: JOB_EVENT_FIELDS.FINISHED_AT.key,
            ...JOB_EVENT_FIELDS.FINISHED_AT.table,
            render: (finishedAt: Date) => formatDate(finishedAt),
        },
        {
            dataIndex: JOB_EVENT_FIELDS.RETRY_COUNT.key,
            key: JOB_EVENT_FIELDS.RETRY_COUNT.key,
            ...JOB_EVENT_FIELDS.RETRY_COUNT.table,
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
            <ListContainer isLoading={tableQuery.isLoading} filters={filters}>
                <ListTable<JobEventRecord>
                    columns={columns}
                    tableProps={tableProps}
                    tableQuery={tableQuery}
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
