'use client';

import {
    FormModalContainer,
    ListContainer,
    ListTable,
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
import { CronExpression, ExecutionServiceEnum, ScheduleType } from './enums';
import { useScheduleExecutionPage } from './hooks';
import type { ScheduleExecutionFormValues, ScheduleExecutionRecord } from './types';

export default function ScheduleExecutionPage() {
    const {
        loading,
        table,
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
            title: 'Loại dịch vụ',
            dataIndex: 'executionService',
            key: 'executionService',
            width: 150,
            ellipsis: true,
            render: (executionService: ExecutionServiceEnum) => (
                <StatusTag status={executionService} />
            ),
        },
        {
            title: 'Loại lịch biểu',
            dataIndex: 'type',
            key: 'type',
            width: 150,
            ellipsis: true,
            render: (type: ScheduleType) => <StatusTag status={type} />,
        },
        {
            title: 'Lịch biểu cron',
            dataIndex: 'cronExpression',
            key: 'cronExpression',
            width: 150,
            ellipsis: true,
            render: (value: string) =>
                capitalizeFirstLetter(getEnumKeyByValue(CronExpression, value) ?? '---'),
        },
        {
            title: 'Chạy gần nhất',
            dataIndex: 'nextRunAt',
            key: 'nextRunAt',
            width: 400,
            sorter: true,
            render: (nextRunAt: Date) => formatDate(nextRunAt),
        },
        {
            title: 'Chạy cuối cùng',
            dataIndex: 'lastRunAt',
            key: 'lastRunAt',
            width: 400,
            sorter: true,
            render: (lastRunAt: Date) => formatDate(lastRunAt),
        },
        {
            title: 'Công việc',
            dataIndex: 'jobCount',
            key: 'jobCount',
            width: 200,
            align: 'center',
            render: (jobCount: number) => jobCount ?? 0,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 200,
            align: 'center',
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
                isLoading={loading || table.tableQuery.isLoading}
                filters={filters}
            >
                <ListTable<ScheduleExecutionRecord>
                    columns={columns}
                    table={table}
                    deleteResource={RESOURCE.SCHEDULES}
                    onEdit={(record) => editModalForm.show(record.id)}
                />
            </ListContainer>

            <FormModalContainer
                modalForm={createModalForm}
                title="Thêm mới lịch biểu thực thi"
                width={600}
                createInitialValues={{
                    name: '',
                    type: '',
                    cronExpression: '',
                    dataProviderId: undefined,
                    itemId: undefined,
                    isActive: true,
                }}
                sections={[{ type: 'plain', fields: formFields }]}
            />
            <FormModalContainer
                modalForm={editModalForm}
                title="Chỉnh sửa lịch biểu thực thi"
                width={600}
                sections={[{ type: 'plain', fields: formFields }]}
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
