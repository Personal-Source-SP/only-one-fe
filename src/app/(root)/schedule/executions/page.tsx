'use client';

import { useMemo } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { CustomButton } from '@/components/custom-antd';
import {
    FilterPanel,
    ListTable,
    ListWrapper,
    type CardAction,
    type IFilterField,
} from '@/components/common';

import { getColumns } from './constants';
import { useScheduleExecutionPage } from './hooks';
import { ScheduleExecutionFormModal, ViewScheduleJobList } from './components';
import type { ScheduleExecutionRecord } from './types';

const ScheduleExecutionPage = () => {
    const {
        loading,
        tableProps,
        tableQuery,
        debouncedSearch,
        createModalForm,
        editModalForm,
        selectedScheduleId,
        setSelectedScheduleId,
        itemOptions,
        dataProviderOptions,
        handleSwitchStatus,
    } = useScheduleExecutionPage();

    const columns = useMemo(() => getColumns(handleSwitchStatus), [handleSwitchStatus]);

    const actions = useMemo<CardAction[]>(
        () => [
            {
                component: (
                    <CustomButton
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => createModalForm.show()}
                    >
                        Thêm lịch biểu thực thi
                    </CustomButton>
                ),
            },
        ],
        [createModalForm],
    );

    const filters = useMemo<IFilterField[]>(
        () => [
            {
                name: 'search',
                type: 'input',
                placeholder: 'Tìm kiếm lịch biểu...',
                onChange: (value) => debouncedSearch(value?.toString() ?? ''),
            },
        ],
        [debouncedSearch],
    );

    return (
        <>
            <ListWrapper
                actions={actions}
                error={tableQuery.error}
                isLoading={loading || tableQuery.isLoading}
                filters={<FilterPanel fields={filters} />}
            >
                <ListTable<ScheduleExecutionRecord>
                    columns={columns}
                    tableProps={tableProps}
                    tableQuery={tableQuery}
                    deleteResource="schedules"
                    onEdit={(record) => editModalForm.show(record.id)}
                />
            </ListWrapper>

            <ScheduleExecutionFormModal
                modalForm={createModalForm}
                itemOptions={itemOptions ?? []}
                dataProviderOptions={dataProviderOptions ?? []}
            />

            <ScheduleExecutionFormModal
                modalForm={editModalForm}
                itemOptions={itemOptions ?? []}
                dataProviderOptions={dataProviderOptions ?? []}
            />

            {!!selectedScheduleId && (
                <ViewScheduleJobList
                    isOpen
                    scheduleId={selectedScheduleId}
                    onClose={() => setSelectedScheduleId(undefined)}
                />
            )}
        </>
    );
};

export default ScheduleExecutionPage;
