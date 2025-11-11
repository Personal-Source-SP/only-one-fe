'use client';

import { CreateFormModal, CustomElement, EditFormModal, TableContainer } from '@/components/custom';
import { NextRunTimes } from '@/components/module/schedule';
import { CronExpression, ElementType, ScheduleType } from '@/enums';
import {
    useCustomMutationData,
    useSelectDataProvider,
    useSelectItem,
    useTableContainer,
} from '@/hooks';
import { ActionTableItem, FormFieldItem, NSchedule } from '@/interfaces';
import { capitalizeFirstLetter, enumToOptions, getEnumKeyByValue } from '@/libs';
import { Icon } from '@iconify/react';
import { Button, Space, Switch } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { FC, useEffect, useState } from 'react';

const ScheduleExecutionPage: FC = () => {
    const [loading, setLoading] = useState(false);
    const [openCreateItemModal, setOpenCreateItemModal] = useState(false);
    const [editItemId, setEditItemId] = useState<string | undefined>(undefined);

    const [type, setType] = useState<ScheduleType | undefined>(undefined);
    const [cronExpression, setCronExpression] = useState<string | undefined>(undefined);

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
            title: 'Loại lịch biểu',
            dataIndex: 'type',
            key: 'type',
            width: 150,
            ellipsis: true,
            render: (type: ScheduleType) => {
                switch (type) {
                    case ScheduleType.DATA_PROVIDER:
                        return 'Nhà cung cấp';
                    case ScheduleType.ITEM:
                        return 'Đối tượng';
                    default:
                        return 'Toàn bộ';
                }
            },
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
            title: 'Lần chạy gần nhất',
            dataIndex: 'nextRunAt',
            key: 'nextRunAt',
            width: 200,
            sorter: true,
            render: (nextRunAt: Date) =>
                nextRunAt ? dayjs(nextRunAt).format('DD/MM/YYYY HH:mm:ss') : '---',
        },
        {
            title: 'Lần chạy cuối cùng',
            dataIndex: 'lastRunAt',
            key: 'lastRunAt',
            width: 200,
            sorter: true,
            render: (lastRunAt: Date) =>
                lastRunAt ? dayjs(lastRunAt).format('DD/MM/YYYY HH:mm:ss') : '---',
        },
        {
            title: 'Số lượng công việc',
            dataIndex: 'scheduleJobs',
            key: 'scheduleJobs',
            width: 200,
            render: (scheduleJobs: NSchedule.IScheduleJob[]) => (
                <span>{scheduleJobs?.length ?? 0} công việc</span>
            ),
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
        </Space>
    );
};

export default ScheduleExecutionPage;
