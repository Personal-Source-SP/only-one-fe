'use client';

import {
    ListContainer,
    StatusTag,
    type ICardAction,
    type IFilterField,
    type IFormField,
} from '@/components/common';
import { ColumnsType, CustomButton, CustomToggle } from '@/components/custom-antd';
import { RESOURCE } from '@/config';
import { capitalizeFirstLetter, formatDate, getEnumKeyByValue } from '@/libs';
import { FormRuleType } from '@/utilities';
import { PlusOutlined } from '@ant-design/icons';
import { ViewScheduleJobList } from './components';
import { EXECUTION_FIELDS } from './constants';
import { CronExpression, ExecutionServiceEnum, ScheduleType } from './enums';
import { useScheduleExecutionPage } from './hooks';
import type { ScheduleExecutionFormValues, ScheduleExecutionRecord } from './types';

export default function ScheduleExecutionPage() {
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

    const columns: ColumnsType<ScheduleExecutionRecord> = [
        {
            title: 'STT',
            key: 'index',
            dataIndex: 'index',
            width: 60,
            align: 'center',
            render: (_: unknown, __: unknown, index: number) => index + 1,
        },
        {
            dataIndex: EXECUTION_FIELDS.EXECUTION_SERVICE.key,
            key: EXECUTION_FIELDS.EXECUTION_SERVICE.key,
            ...EXECUTION_FIELDS.EXECUTION_SERVICE.table,
            render: (executionService: ExecutionServiceEnum) => (
                <StatusTag status={executionService} />
            ),
        },
        {
            dataIndex: EXECUTION_FIELDS.TYPE.key,
            key: EXECUTION_FIELDS.TYPE.key,
            ...EXECUTION_FIELDS.TYPE.table,
            render: (type: ScheduleType) => <StatusTag status={type} />,
        },
        {
            dataIndex: EXECUTION_FIELDS.CRON_EXPRESSION.key,
            key: EXECUTION_FIELDS.CRON_EXPRESSION.key,
            ...EXECUTION_FIELDS.CRON_EXPRESSION.table,
            render: (value: string) =>
                capitalizeFirstLetter(getEnumKeyByValue(CronExpression, value) ?? '---'),
        },
        {
            dataIndex: EXECUTION_FIELDS.NEXT_RUN_AT.key,
            key: EXECUTION_FIELDS.NEXT_RUN_AT.key,
            ...EXECUTION_FIELDS.NEXT_RUN_AT.table,
            render: (nextRunAt: Date) => formatDate(nextRunAt),
        },
        {
            dataIndex: EXECUTION_FIELDS.LAST_RUN_AT.key,
            key: EXECUTION_FIELDS.LAST_RUN_AT.key,
            ...EXECUTION_FIELDS.LAST_RUN_AT.table,
            render: (lastRunAt: Date) => formatDate(lastRunAt),
        },
        {
            dataIndex: EXECUTION_FIELDS.JOB_COUNT.key,
            key: EXECUTION_FIELDS.JOB_COUNT.key,
            ...EXECUTION_FIELDS.JOB_COUNT.table,
            render: (jobCount: number) => jobCount ?? 0,
        },
        {
            dataIndex: EXECUTION_FIELDS.IS_ACTIVE.key,
            key: EXECUTION_FIELDS.IS_ACTIVE.key,
            ...EXECUTION_FIELDS.IS_ACTIVE.table,
            render: (isActive: boolean, record: ScheduleExecutionRecord) => (
                <CustomToggle
                    size="small"
                    checked={isActive}
                    onChange={(checked) => handleSwitchStatus(record?.id ?? '', checked)}
                />
            ),
        },
    ];

    const actions: ICardAction[] = [
        {
            label: 'Thêm lịch biểu thực thi',
            icon: <PlusOutlined />,
            permissionAction: 'create',
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
    ];

    const filters: IFilterField[] = [
        {
            name: 'search',
            type: 'input',
            isPrimary: true,
            placeholder: 'Tìm kiếm lịch biểu...',
            onChange: (value) => debouncedSearch(value?.toString() ?? ''),
        },
    ];

    const formFields: IFormField<ScheduleExecutionFormValues>[] = [
        {
            name: 'name',
            label: 'Tên lịch biểu',
            type: 'input',
            rulesConfig: [{ type: FormRuleType.Required, message: 'Vui lòng nhập tên lịch biểu' }],
            inputProps: { placeholder: 'Nhập tên lịch biểu' },
        },
        {
            name: 'cronExpression',
            label: 'Biểu thức Cron',
            type: 'input',
            rulesConfig: [{ type: FormRuleType.Required, message: 'Vui lòng nhập biểu thức Cron' }],
            inputProps: { placeholder: 'Ví dụ: 0 0 * * *' },
        },
        {
            name: 'dataProviderId',
            label: 'Nhà cung cấp (nếu có)',
            type: 'select',
            selectProps: {
                options: dataProviderOptions ?? [],
                placeholder: 'Chọn nhà cung cấp',
                allowClear: true,
            },
        },
        {
            name: 'itemId',
            label: 'Đối tượng (nếu có)',
            type: 'select',
            selectProps: {
                options: itemOptions ?? [],
                placeholder: 'Chọn đối tượng',
                allowClear: true,
            },
        },
        {
            name: 'isActive',
            label: 'Trạng thái hoạt động',
            type: 'switch',
        },
    ];

    return (
        <>
            <ListContainer
                actions={actions}
                isLoading={loading || tableQuery.isLoading}
                filters={filters}
                table={{
                    columns,
                    tableProps,
                    tableQuery,
                    deleteResource: RESOURCE.SCHEDULES,
                    onEdit: (record) => editModalForm.show(record.id),
                }}
                formModal={[
                    {
                        modalForm: createModalForm,
                        title: 'Thêm mới lịch biểu thực thi',
                        width: 600,
                        createInitialValues: {
                            name: '',
                            type: '',
                            cronExpression: '',
                            dataProviderId: undefined,
                            itemId: undefined,
                            isActive: true,
                        },
                        sections: [{ type: 'plain', fields: formFields }],
                    },
                    {
                        modalForm: editModalForm,
                        title: 'Chỉnh sửa lịch biểu thực thi',
                        width: 600,
                        sections: [{ type: 'plain', fields: formFields }],
                    },
                ]}
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
}
