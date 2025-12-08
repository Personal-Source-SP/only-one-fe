'use client';

import { StatusTag } from '@/components/common';
import { CreateFormModal, CustomElement, EditFormModal, TableContainer } from '@/components/custom';
import { ElementType, SimulationItemStatus } from '@/enums';
import { useCustomMutationData, useSelectSimulationContext, useTableContainer } from '@/hooks';
import { ActionTableItem, FormFieldItem, NSimulation } from '@/interfaces';
import { formatDate } from '@/libs';
import { Icon } from '@iconify/react';
import { Button, Space } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { FC, useState } from 'react';

const SimulationItemsPage: FC = () => {
    const [loading, setLoading] = useState(false);
    const [openCreateItemModal, setOpenCreateItemModal] = useState(false);
    const [editItemId, setEditItemId] = useState<string | undefined>(undefined);

    const { handleCustomMutationData } = useCustomMutationData();

    const { options: simulationContextOptions, query: simulationContextQuery } =
        useSelectSimulationContext();

    const tableContainerData = useTableContainer({
        resource: 'simulation-items',
    });

    const columns: ColumnsType<NSimulation.ISimulationItem> = [
        {
            title: 'STT',
            key: 'index',
            dataIndex: 'index',
            width: 60,
            align: 'center',
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 130,
            align: 'center',
            render: (status: string) => <StatusTag status={status} />,
        },
        {
            title: 'Hết hạn',
            dataIndex: 'expiresAt',
            key: 'expiresAt',
            width: 200,
            sorter: true,
            render: (expiresAt: Date) => formatDate(expiresAt),
        },
    ];

    const formFields: FormFieldItem[] = [
        {
            type: 'select',
            name: 'simulationContextId',
            label: 'Ngữ cảnh',
            rules: [{ required: true, message: 'Vui lòng chọn ngữ cảnh' }],
            selectProps: {
                options: simulationContextOptions,
            },
            onChange: (value, form) => {
                const contextSelected = simulationContextQuery?.data?.data?.find(
                    (item: NSimulation.ISimulationContext) => item.id === value,
                );
                if (!contextSelected) return;

                form?.setFieldsValue({
                    payload: JSON.stringify(contextSelected.defaultPayload ?? { referenceUrl: '' }),
                });
            },
        },
        {
            type: 'code-display',
            name: 'payload',
            label: 'Payload',
            rules: [{ required: true, message: 'Vui lòng nhập payload' }],
            codeProps: {
                language: 'json',
            },
        },
    ];

    const actionItems: ActionTableItem[] = [
        {
            key: 'start',
            label: 'Start',
            icon: <Icon icon="lucide:play" />,
            onClick: (record) =>
                handleSimulationItemAction(record?.id, SimulationItemStatus.PROCESSING),
        },
        {
            key: 'edit',
            label: 'Chỉnh sửa',
            icon: <Icon icon="lucide:edit" />,
            onClick: (record) => setEditItemId(record?.id),
        },
    ];

    const handleSimulationItemAction = (id: string, status: SimulationItemStatus) => {
        if (!id) return;

        const actionMessages: Record<string, { success: string; failed: string }> = {
            [SimulationItemStatus.PROCESSING]: {
                success: 'Bắt đầu mô phỏng thành công',
                failed: 'Bắt đầu mô phỏng thất bại',
            },
        };

        const action: Record<string, string> = {
            [SimulationItemStatus.PROCESSING]: 'start',
        };

        setLoading(true);

        handleCustomMutationData({
            values: {},
            method: 'post',
            url: `simulation-items/${id}/${action[status]}`,
            successNotification: (data) => {
                if (!data?.data?.isSuccess) {
                    setLoading(false);

                    return {
                        type: 'error',
                        message: actionMessages[status]?.failed,
                        description: data?.data?.message ?? actionMessages[status]?.failed,
                    };
                }

                setLoading(false);
                tableContainerData?.tableQuery?.refetch();

                return {
                    type: 'success',
                    message: actionMessages[status].success,
                };
            },
            errorNotification: (error) => {
                setLoading(false);

                return {
                    type: 'error',
                    message: actionMessages[status].failed,
                    description: error?.message ?? actionMessages[status].failed,
                };
            },
        });
    };

    return (
        <Space size="middle" direction="vertical" className="w-full h-full">
            <CustomElement
                elementType={ElementType.TITLE}
                actions={[
                    <Button
                        type="primary"
                        title="Thêm mô phỏng"
                        key="add-simulation-item"
                        icon={<Icon icon="lucide:plus" />}
                        onClick={() => setOpenCreateItemModal(true)}
                    />,
                ]}
            />

            <TableContainer
                loading={loading}
                columns={columns}
                actionItems={actionItems}
                resource="simulation-items"
                tableContainerData={tableContainerData}
                filterSearch={{ placeholder: 'Tìm kiếm mô phỏng' }}
            />

            <CreateFormModal
                formFields={formFields}
                open={openCreateItemModal}
                title="Thêm mới mô phỏng"
                resource="simulation-items"
                onClose={() => {
                    setOpenCreateItemModal(false);
                    tableContainerData?.tableQuery?.refetch();
                }}
                initialValues={{
                    payload: JSON.stringify({
                        referenceUrl: '',
                    }),
                }}
                onTransformValues={(values) => {
                    try {
                        return {
                            ...values,
                            payload: JSON.parse(values.payload),
                        };
                    } catch {
                        return values;
                    }
                }}
            />

            <EditFormModal
                id={editItemId ?? ''}
                formFields={formFields}
                title="Chỉnh sửa mô phỏng"
                resource="simulation-items"
                onClose={() => {
                    setEditItemId(undefined);
                    tableContainerData?.tableQuery?.refetch();
                }}
            />
        </Space>
    );
};

export default SimulationItemsPage;
