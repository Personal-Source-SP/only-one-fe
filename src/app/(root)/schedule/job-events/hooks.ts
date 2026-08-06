'use client';

import { useState } from 'react';
import { useTableContainer } from '@/hooks';
import { NSchedule } from '@/interfaces';

export const useScheduleJobEventsPage = () => {
    const [selectedJobEvent, setSelectedJobEvent] = useState<
        NSchedule.IScheduleJobEvent | undefined
    >(undefined);

    const tableContainerData = useTableContainer({
        resource: 'schedule-job-events',
    });

    return {
        selectedJobEvent,
        setSelectedJobEvent,
        tableContainerData,
    };
};
