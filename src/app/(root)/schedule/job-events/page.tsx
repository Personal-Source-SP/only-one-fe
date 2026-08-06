'use client';

import { Icon } from '@iconify/react';
import { DataTableContainer } from '@/components/common';
import { ActionTableItem } from '@/interfaces';

import { columns, filterSearch } from './constants';
import { useScheduleJobEventsPage } from './hooks';
import { ViewJobEvent } from './components';

const ScheduleJobEventsPage = () => {
    const { selectedJobEvent, setSelectedJobEvent, tableContainerData } =
        useScheduleJobEventsPage();

    const actionItems: ActionTableItem[] = [
        {
            key: 'view',
            label: 'Xem',
            icon: <Icon icon="lucide:eye" />,
            onClick: (record) => setSelectedJobEvent(record),
        },
    ];

    return (
        <>
            <DataTableContainer
                columns={columns}
                actionItems={actionItems}
                title="Danh sách sự kiện lịch biểu"
                description="Xem và quản lý các sự kiện lịch biểu"
                tableContainerData={tableContainerData}
                filterSearch={filterSearch}
            />

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
