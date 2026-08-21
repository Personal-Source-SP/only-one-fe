'use client';

import { useState } from 'react';
import { API_ENDPOINT } from '@/config';
import { useCustomTable } from '@/hooks';
import type { JobEventRecord } from './types';

export const useScheduleJobEventsPage = () => {
    const [selectedJobEvent, setSelectedJobEvent] = useState<JobEventRecord | undefined>(undefined);

    const { tableProps, tableQuery, debouncedSearch, setFilters, setCurrentPage } =
        useCustomTable<JobEventRecord>({
            resource: API_ENDPOINT.SCHEDULE_JOB_EVENTS.BASE,
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
