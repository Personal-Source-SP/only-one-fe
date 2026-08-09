import React from 'react';
import { ColumnsType, CustomToggle } from '@/components/custom-antd';
import { StatusTag } from '@/components/common';
import { CronExpression, ExecutionServiceEnum, ScheduleType } from '@/enums';
import { FormFieldItem, NSchedule } from '@/interfaces';
import { capitalizeFirstLetter, enumToOptions, formatDate, getEnumKeyByValue } from '@/libs';

export const executionServiceOptions = [
    {
        label: 'Nhà cung cấp',
        value: ExecutionServiceEnum.DATA_PROVIDER,
    },
];

export const scheduleTypeOptions = [
    {
        label: 'Toàn bộ',
        value: ScheduleType.GLOBAL,
    },
    {
        label: 'Nhà cung cấp',
        value: ScheduleType.DATA_PROVIDER,
    },
    {
        label: 'Đối tượng',
        value: ScheduleType.ITEM,
    },
];

export const getColumns = (
    handleSwitchStatus: (id: string, active: boolean) => void,
): ColumnsType<NSchedule.ISchedule> => [
    {
        title: 'STT',
        key: 'index',
        dataIndex: 'index',
        width: 60,
        align: 'center',
        render: (_: any, __: any, index: number) => index + 1,
    },
    {
        title: 'Loại dịch vụ',
        dataIndex: 'executionService',
        key: 'executionService',
        width: 150,
        ellipsis: true,
        render: (executionService: ExecutionServiceEnum) => <StatusTag status={executionService} />,
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
        render: (isActive: boolean, record: NSchedule.ISchedule) => (
            <CustomToggle
                size="small"
                checked={isActive}
                onChange={(checked) => handleSwitchStatus(record?.id ?? '', checked)}
            />
        ),
    },
];

export const getFormFields = (
    type: ScheduleType | undefined,
    setType: (t: ScheduleType) => void,
    setCronExpression: (c: string) => void,
    dataProviderOptions: any[],
    itemOptions: any[],
): FormFieldItem[] => [
    {
        type: 'select',
        disabled: true,
        label: 'Loại dịch vụ',
        name: 'executionService',
        rules: [{ required: true, message: 'Vui lòng chọn dịch vụ thực thi' }],
        selectProps: {
            options: executionServiceOptions,
        },
    },
    {
        name: 'type',
        type: 'select',
        label: 'Loại lịch biểu',
        onChange: (value) => setType(value as ScheduleType),
        rules: [{ required: true, message: 'Vui lòng chọn loại lịch biểu' }],
        selectProps: {
            options: scheduleTypeOptions,
        },
    },
    {
        type: 'select',
        label: 'Nhà cung cấp',
        name: 'dataProviderId',
        hidden: type !== ScheduleType.DATA_PROVIDER,
        disabled: type !== ScheduleType.DATA_PROVIDER,
        rules: [
            {
                message: 'Vui lòng chọn nhà cung cấp',
                required: type === ScheduleType.DATA_PROVIDER,
            },
        ],
        selectProps: {
            placeholder: 'Chọn nhà cung cấp',
            options: dataProviderOptions ?? [],
        },
    },
    {
        type: 'select',
        label: 'Đối tượng',
        name: 'itemId',
        hidden: type !== ScheduleType.ITEM,
        disabled: type !== ScheduleType.ITEM,
        rules: [{ required: type === ScheduleType.ITEM, message: 'Vui lòng chọn đối tượng' }],
        selectProps: {
            placeholder: 'Chọn đối tượng',
            options: itemOptions ?? [],
        },
    },
    {
        type: 'select',
        name: 'cronExpression',
        label: 'Biểu thức cron',
        onChange: (value) => setCronExpression(value as string),
        rules: [{ required: true, message: 'Vui lòng chọn biểu thức cron' }],
        selectProps: {
            showSearch: true,
            options: enumToOptions(CronExpression) ?? [],
        },
    },
    {
        type: 'input',
        name: 'minScrapeIntervalMinutes',
        label: 'Khoảng thời gian tối thiểu giữa 2 lần chạy',
        rules: [
            {
                required: true,
                message: 'Vui lòng nhập khoảng thời gian tối thiểu giữa 2 lần chạy',
            },
        ],
    },
    {
        type: 'switch',
        name: 'enabled',
        label: 'Kích hoạt',
        rules: [{ required: true, message: 'Vui lòng chọn kích hoạt lịch biểu thực thi' }],
        switchProps: {
            placeholder: 'Kích hoạt lịch biểu thực thi',
        },
    },
];

export const initialValues = {
    enabled: true,
    type: ScheduleType.GLOBAL,
    minScrapeIntervalMinutes: 3,
    executionService: ExecutionServiceEnum.DATA_PROVIDER,
    cronExpression: CronExpression['MỖI NGÀY LÚC 8 GIỜ TỐI'],
};

export const filterSearch = {
    placeholder: 'Tìm kiếm lịch biểu thực thi',
};
