'use client';

import { StatusTag } from '@/components/common';
import { CreateFormModal, CustomElement, EditFormModal, TableContainer } from '@/components/custom';
import { ElementType, SimulationService } from '@/enums';
import { useCustomMutationData, useTableContainer } from '@/hooks';
import { ActionTableItem, FormFieldItem, NSimulation } from '@/interfaces';
import { enumToOptions, formatDate } from '@/libs';
import { Icon } from '@iconify/react';
import { Button, Space } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useState } from 'react';

const SimulationContextsPage = () => {
    const [loading, setLoading] = useState(false);
    const [openCreateItemModal, setOpenCreateItemModal] = useState(false);
    const [editItemId, setEditItemId] = useState<string | undefined>(undefined);

    const { handleCustomMutationData } = useCustomMutationData();

    const tableContainerData = useTableContainer({
        resource: 'simulation-contexts',
    });

    const columns: ColumnsType<NSimulation.ISimulationContext> = [
        {
            title: 'STT',
            key: 'index',
            dataIndex: 'index',
            width: 60,
            align: 'center',
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: 'Tên ngữ cảnh',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            ellipsis: true,
        },
        {
            title: 'URL nguồn',
            dataIndex: 'baseUrl',
            key: 'baseUrl',
            width: 220,
            ellipsis: true,
        },
        {
            title: 'Dịch vụ thực thi',
            dataIndex: 'serviceExecution',
            key: 'serviceExecution',
            width: 180,
            render: (serviceExecution: SimulationService) => serviceExecution,
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
            title: 'Chạy gần nhất',
            dataIndex: 'lastSuccessfulRunAt',
            key: 'lastSuccessfulRunAt',
            width: 200,
            sorter: true,
            render: (lastSuccessfulRunAt: Date) => formatDate(lastSuccessfulRunAt),
        },
    ];

    const formFields: FormFieldItem[] = [
        {
            type: 'input',
            name: 'name',
            label: 'Tên ngữ cảnh',
            rules: [{ required: true, message: 'Vui lòng nhập tên ngữ cảnh' }],
        },
        {
            type: 'input',
            name: 'baseUrl',
            label: 'URL nguồn',
            rules: [{ required: true, message: 'Vui lòng nhập URL ngữ cảnh' }],
        },
        {
            type: 'select',
            name: 'serviceExecution',
            label: 'Dịch vụ thực thi',
            rules: [{ required: true, message: 'Vui lòng chọn dịch vụ thực thi' }],
            selectProps: {
                options: enumToOptions(SimulationService) ?? [],
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
            key: 'create-simulation-items',
            label: 'Tạo mô phỏng',
            icon: <Icon icon="lucide:plus" />,
            onClick: (record) => handleCreateSimulationItem(record?.id),
        },
    ];

    const handleCreateSimulationItem = (id: string) => {
        setLoading(true);

        handleCustomMutationData({
            method: 'post',
            url: 'simulation-items',
            values: { simulationContextId: id },
            successNotification: (data) => {
                if (!data?.data?.isSuccess) {
                    setLoading(false);

                    return {
                        type: 'error',
                        message: 'Tạo mô phỏng thất bại',
                        description: data?.data?.message ?? 'Tạo mô phỏng thất bại',
                    };
                }

                setLoading(false);

                tableContainerData?.tableQuery?.refetch();

                return {
                    type: 'success',
                    message: 'Tạo mô phỏng thành công',
                };
            },
            errorNotification: (error) => {
                setLoading(false);

                return {
                    type: 'error',
                    message: 'Tạo mô phỏng thất bại',
                    description: error?.message ?? 'Tạo mô phỏng thất bại',
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
                        title="Thêm ngữ cảnh mô phỏng"
                        key="add-simulation-context"
                        icon={<Icon icon="lucide:plus" />}
                        onClick={() => setOpenCreateItemModal(true)}
                    />,
                ]}
            />

            <TableContainer
                loading={loading}
                columns={columns}
                actionItems={actionItems}
                resource="simulation-contexts"
                tableContainerData={tableContainerData}
                filterSearch={{ placeholder: 'Tìm kiếm ngữ cảnh mô phỏng' }}
            />

            <CreateFormModal
                formFields={formFields}
                open={openCreateItemModal}
                resource="simulation-contexts"
                title="Thêm mới ngữ cảnh mô phỏng"
                onClose={() => {
                    setOpenCreateItemModal(false);
                    tableContainerData?.tableQuery?.refetch();
                }}
            />

            <EditFormModal
                id={editItemId ?? ''}
                formFields={formFields}
                resource="simulation-contexts"
                title="Chỉnh sửa ngữ cảnh mô phỏng"
                onClose={() => {
                    setEditItemId(undefined);
                    tableContainerData?.tableQuery?.refetch();
                }}
            />
        </Space>
    );
};

export default SimulationContextsPage;
