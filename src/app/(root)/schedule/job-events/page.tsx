'use client';

import { useMemo } from 'react';
import { EyeOutlined } from '@ant-design/icons';
import {
    FilterPanel,
    ListTable,
    ListWrapper,
    type IFilterField,
} from '@/components/custom-container';

import { columns } from './constants';
import { useScheduleJobEventsPage } from './hooks';
import { ViewJobEvent } from './components';
import type { JobEventRecord } from './types';

const ScheduleJobEventsPage = () => {
    const { tableProps, tableQuery, debouncedSearch, selectedJobEvent, setSelectedJobEvent } =
        useScheduleJobEventsPage();

    const filters = useMemo<IFilterField[]>(
        () => [
            {
                name: 'search',
                type: 'input',
                placeholder: 'Tìm kiếm sự kiện lịch biểu...',
                onChange: (value) => debouncedSearch(value?.toString() ?? ''),
            },
        ],
        [debouncedSearch],
    );

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
