'use client';

import {
    ContentSection,
    CreateFormDialog,
    DataTableContainer,
    EditFormDialog,
    StatusTag,
} from '@/components/common';
import { ColumnsType, CustomButton, CustomSpace, CustomToggle } from '@/components/custom';
import { MessageType } from '@/enums';
import { NextRunTimes, ViewScheduleJobList } from '@/components/module/schedule';
import { CronExpression, ElementType, ExecutionServiceEnum, ScheduleType } from '@/enums';
import {
    useCustomMutationData,
    useSelectDataProvider,
    useSelectItem,
    useTableContainer,
} from '@/hooks';
import { ActionTableItem, FormFieldItem, NSchedule } from '@/interfaces';
import { capitalizeFirstLetter, enumToOptions, formatDate, getEnumKeyByValue } from '@/libs';
import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';

const ScheduleExecutionPage = () => {
    const [loading, setLoading] = useState(false);
    const [openCreateItemModal, setOpenCreateItemModal] = useState(false);
    const [editItemId, setEditItemId] = useState<string | undefined>(undefined);

    const [type, setType] = useState<ScheduleType | undefined>(undefined);
    const [cronExpression, setCronExpression] = useState<string | undefined>(undefined);

    const [selectedScheduleId, setSelectedScheduleId] = useState<string | undefined>(undefined);

    const { handleCustomMutationData } = useCustomMutationData();

    const { options: itemOptions, query: itemQuery } = useSelectItem({ enabled: false });
    const { options: dataProviderOptions, query: dataProviderQuery } = useSelectDataProvider({
        enabled: false,
    });

    const tableContainerData = useTableContainer({
        resource: 'schedules',
    });

    useEffect(() => {
        switch (type) {
            case ScheduleType.DATA_PROVIDER:
                dataProviderQuery?.refetch();
                break;
            case ScheduleType.ITEM:
                itemQuery?.refetch();
                break;
        }
    }, [type]);

    const columns: ColumnsType<NSchedule.ISchedule> = [
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
            render: (cronExpression: string) =>
                capitalizeFirstLetter(getEnumKeyByValue(CronExpression, cronExpression) ?? '---'),
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

    const formFields: FormFieldItem[] = [
        {
            type: 'select',
            disabled: true,
            label: 'Loại dịch vụ',
            name: 'executionService',
            rules: [{ required: true, message: 'Vui lòng chọn dịch vụ thực thi' }],
            selectProps: {
                options: [
                    {
                        label: 'Nhà cung cấp',
                        value: ExecutionServiceEnum.DATA_PROVIDER,
                    },
                ],
            },
        },
        {
            name: 'type',
            type: 'select',
            label: 'Loại lịch biểu',
            onChange: (value) => setType(value as ScheduleType),
            rules: [{ required: true, message: 'Vui lòng chọn loại lịch biểu' }],
            selectProps: {
                options: [
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
                ],
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

    const actionItems: ActionTableItem[] = [
        {
            key: 'edit',
            label: 'Chỉnh sửa',
            icon: <Icon icon="lucide:edit" />,
            onClick: (record) => setEditItemId(record?.id),
        },
        {
            key: 'manual-trigger',
            label: 'Chạy thủ công',
            icon: <Icon icon="lucide:play" />,
            onClick: (record) => handleManualTrigger(record?.id),
        },
        {
            key: 'view-schedule-job-list',
            label: 'Xem danh sách công việc',
            icon: <Icon icon="lucide:list" />,
            onClick: (record) => setSelectedScheduleId(record?.id),
        },
    ];

    const handleSwitchStatus = (id: string, active: boolean) => {
        setLoading(true);

        handleCustomMutationData({
            values: {},
            method: 'put',
            url: `schedules/${id}/switch-status/${active}`,
            successNotification: (data) => {
                if (!data?.data?.isSuccess) {
                    setLoading(false);

                    return {
                        type: MessageType.ERROR,
                        message: 'Chuyển trạng thái thất bại',
                        description: data?.data?.message ?? 'Chuyển trạng thái thất bại',
                    };
                }

                setLoading(false);

                tableContainerData?.tableQuery?.refetch();

                return {
                    type: MessageType.SUCCESS,
                    message: 'Chuyển trạng thái thành công',
                };
            },
            errorNotification: (error) => {
                setLoading(false);

                return {
                    type: MessageType.ERROR,
                    message: 'Chuyển trạng thái thất bại',
                    description: error?.message ?? 'Chuyển trạng thái thất bại',
                };
            },
        });
    };

    const handleManualTrigger = (id: string) => {
        setLoading(true);

        handleCustomMutationData({
            values: {},
            method: 'post',
            url: `schedules/${id}/manual-trigger`,
            successNotification: (data) => {
                if (!data?.data?.isSuccess) {
                    setLoading(false);

                    return {
                        type: MessageType.ERROR,
                        message: 'Chạy thủ công thất bại',
                        description: data?.data?.message ?? 'Chạy thủ công thất bại',
                    };
                }

                setLoading(false);

                tableContainerData?.tableQuery?.refetch();

                return {
                    type: MessageType.SUCCESS,
                    message: 'Chạy thủ công thành công',
                };
            },
            errorNotification: (error) => {
                setLoading(false);

                return {
                    type: MessageType.ERROR,
                    message: 'Chạy thủ công thất bại',
                    description: error?.message ?? 'Chạy thủ công thất bại',
                };
            },
        });
    };

    return (
        <CustomSpace size="middle" direction="vertical" className="w-full h-full">
            <ContentSection
                elementType={ElementType.TITLE}
                actions={[
                    <CustomButton
                        type="primary"
                        key="add-schedule-execution"
                        title="Thêm lịch biểu thực thi"
                        icon={<Icon icon="lucide:plus" />}
                        onClick={() => setOpenCreateItemModal(true)}
                    />,
                ]}
            />

            <DataTableContainer
                loading={loading}
                columns={columns}
                resource="schedules"
                actionItems={actionItems}
                tableContainerData={tableContainerData}
                filterSearch={{ placeholder: 'Tìm kiếm lịch biểu thực thi' }}
            />

            <CreateFormDialog
                resource="schedules"
                formFields={formFields}
                open={openCreateItemModal}
                title="Thêm mới lịch biểu thực thi"
                bottomRender={<NextRunTimes cron={cronExpression} />}
                initialValues={{
                    enabled: true,
                    type: ScheduleType.GLOBAL,
                    minScrapeIntervalMinutes: 3,
                    executionService: ExecutionServiceEnum.DATA_PROVIDER,
                    cronExpression: CronExpression['MỖI NGÀY LÚC 8 GIỜ TỐI'],
                }}
                onClose={() => {
                    setOpenCreateItemModal(false);
                    tableContainerData?.tableQuery?.refetch();
                }}
            />

            <EditFormDialog
                resource="schedules"
                id={editItemId ?? ''}
                formFields={formFields}
                title="Chỉnh sửa lịch biểu thực thi"
                onClose={() => {
                    setEditItemId(undefined);
                    tableContainerData?.tableQuery?.refetch();
                }}
            />

            {!!selectedScheduleId && (
                <ViewScheduleJobList
                    isOpen
                    scheduleId={selectedScheduleId}
                    onClose={() => setSelectedScheduleId(undefined)}
                />
            )}
        </CustomSpace>
    );
};

export default ScheduleExecutionPage;
