'use client';

import { StatusTag } from '@/components/common';
import { CreateFormModal, CustomElement, EditFormModal, TableContainer } from '@/components/custom';
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
import { Button, Space, Switch } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { FC, useEffect, useState } from 'react';

const ScheduleExecutionPage: FC = () => {
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
                <Switch
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
            options: [
                {
                    label: 'Nhà cung cấp',
                    value: ExecutionServiceEnum.DATA_PROVIDER,
                },
            ],
        },
        {
            name: 'type',
            type: 'select',
            label: 'Loại lịch biểu',
            onChange: (value) => setType(value),
            rules: [{ required: true, message: 'Vui lòng chọn loại lịch biểu' }],
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
        {
            type: 'select',
            label: 'Nhà cung cấp',
            name: 'dataProviderId',
            placeholder: 'Chọn nhà cung cấp',
            options: dataProviderOptions ?? [],
            hidden: type !== ScheduleType.DATA_PROVIDER,
            disabled: type !== ScheduleType.DATA_PROVIDER,
            rules: [
                {
                    message: 'Vui lòng chọn nhà cung cấp',
                    required: type === ScheduleType.DATA_PROVIDER,
                },
            ],
        },
        {
            type: 'select',
            label: 'Đối tượng',
            name: 'itemId',
            placeholder: 'Chọn đối tượng',
            options: itemOptions ?? [],
            hidden: type !== ScheduleType.ITEM,
            disabled: type !== ScheduleType.ITEM,
            rules: [{ required: type === ScheduleType.ITEM, message: 'Vui lòng chọn đối tượng' }],
        },
        {
            type: 'select',
            showSearch: true,
            name: 'cronExpression',
            label: 'Biểu thức cron',
            options: enumToOptions(CronExpression) ?? [],
            onChange: (value) => setCronExpression(value),
            rules: [{ required: true, message: 'Vui lòng chọn biểu thức cron' }],
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
            placeholder: 'Kích hoạt lịch biểu thực thi',
            rules: [{ required: true, message: 'Vui lòng chọn kích hoạt lịch biểu thực thi' }],
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
                        type: 'error',
                        message: 'Chuyển trạng thái thất bại',
                        description: data?.data?.message ?? 'Chuyển trạng thái thất bại',
                    };
                }

                setLoading(false);

                tableContainerData?.tableQuery?.refetch();

                return {
                    type: 'success',
                    message: 'Chuyển trạng thái thành công',
                };
            },
            errorNotification: (error) => {
                setLoading(false);

                return {
                    type: 'error',
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
                        type: 'error',
                        message: 'Chạy thủ công thất bại',
                        description: data?.data?.message ?? 'Chạy thủ công thất bại',
                    };
                }

                setLoading(false);

                tableContainerData?.tableQuery?.refetch();

                return {
                    type: 'success',
                    message: 'Chạy thủ công thành công',
                };
            },
            errorNotification: (error) => {
                setLoading(false);

                return {
                    type: 'error',
                    message: 'Chạy thủ công thất bại',
                    description: error?.message ?? 'Chạy thủ công thất bại',
                };
            },
        });
    };

    return (
        <Space size="middle" direction="vertical" className="w-full h-full">
            <CustomElement
                title="Danh sách lịch biểu thực thi"
                elementType={ElementType.TITLE}
                actions={[
                    <Button
                        type="primary"
                        key="add-schedule-execution"
                        icon={<Icon icon="lucide:plus" />}
                        onClick={() => setOpenCreateItemModal(true)}
                    >
                        Thêm lịch biểu thực thi
                    </Button>,
                ]}
            />

            <TableContainer
                loading={loading}
                columns={columns}
                resource="schedules"
                actionItems={actionItems}
                tableContainerData={tableContainerData}
                filterSearch={{ placeholder: 'Tìm kiếm lịch biểu thực thi' }}
            />

            <CreateFormModal
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

            <EditFormModal
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
        </Space>
    );
};

export default ScheduleExecutionPage;
