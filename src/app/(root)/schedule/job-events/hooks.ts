'use client';

import { useState } from 'react';
import { API_ENDPOINT } from '@/config';
import { useCustomTable } from '@/hooks';
import type { JobEventRecord } from './types';

export const useScheduleJobEventsPage = () => {
    const [selectedJobEvent, setSelectedJobEvent] = useState<JobEventRecord | undefined>(undefined);

    const table = useCustomTable<JobEventRecord>({
        resource: API_ENDPOINT.SCHEDULE_JOB_EVENTS.BASE,
    });

    return {
        table,
        debouncedSearch: table.debouncedSearch,
        setFilters: table.setFilters,
        setCurrentPage: table.setCurrentPage,
        selectedJobEvent,
        setSelectedJobEvent,
    };
};
