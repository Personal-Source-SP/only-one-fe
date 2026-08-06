'use client';

import { useState } from 'react';
import { useCustomTable } from '@/hooks';
import type { JobEventRecord } from './types';

export const useScheduleJobEventsPage = () => {
    const [selectedJobEvent, setSelectedJobEvent] = useState<JobEventRecord | undefined>(undefined);

    const { tableProps, tableQuery, debouncedSearch, setFilters, setCurrentPage } =
        useCustomTable<JobEventRecord>({
            resource: 'schedule-job-events',
        });

    return {
        tableProps,
        tableQuery,
        debouncedSearch,
        setFilters,
        setCurrentPage,
        selectedJobEvent,
        setSelectedJobEvent,
    };
};
