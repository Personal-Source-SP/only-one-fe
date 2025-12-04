'use client';

import { StatusTag } from '@/components/common';
import { CreateFormModal, CustomElement, EditFormModal, TableContainer } from '@/components/custom';
import { CloudDataProviderType, ElementType } from '@/enums';
import { useTableContainer } from '@/hooks';
import { ActionTableItem, FormFieldItem, NCloudData } from '@/interfaces';
import { enumToOptions, formatDate, formatFileSize } from '@/libs';
import { Icon } from '@iconify/react';
import { Button, Space } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useState } from 'react';

const CloudDataProvider = () => {
    const [openCreateItemModal, setOpenCreateItemModal] = useState(false);
    const [editItemId, setEditItemId] = useState<string | undefined>(undefined);

    const tableContainerData = useTableContainer({
        resource: 'cloud-data-providers',
    });

    const columns: ColumnsType<NCloudData.ICloudDataProvider> = [
        {
            title: 'STT',
            key: 'index',
            dataIndex: 'index',
            width: 60,
            align: 'center',
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: 'Tên kho',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            ellipsis: true,
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            width: 150,
            render: (type: CloudDataProviderType) => <StatusTag status={type?.toUpperCase()} />,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 150,
            align: 'center',
            render: (isActive: boolean) => <StatusTag status={isActive ? 'active' : 'inactive'} />,
        },
        {
            title: 'Tổng số dữ liệu',
            dataIndex: 'totalItems',
            key: 'totalItems',
            width: 150,
            align: 'center',
            render: (totalItems: number) => totalItems?.toLocaleString() ?? 0,
        },
        {
            title: 'Tổng dung lượng',
            dataIndex: 'totalSize',
            key: 'totalSize',
            width: 150,
            align: 'center',
            render: (totalSize: number) => formatFileSize(totalSize),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 200,
            sorter: true,
            render: (createdAt: Date) => formatDate(createdAt),
        },
    ];

    const formFields: FormFieldItem[] = [
        {
            type: 'input',
            name: 'name',
            label: 'Tên nhà cung cấp',
            rules: [{ required: true, message: 'Vui lòng nhập tên nhà cung cấp' }],
        },
        {
            type: 'select',
            name: 'type',
            label: 'Loại',
            disabled: true,
            rules: [{ required: true, message: 'Vui lòng chọn loại nhà cung cấp' }],
            selectProps: {
                options: enumToOptions(CloudDataProviderType) ?? [],
            },
        },
        {
            type: 'code-display',
            name: 'config',
            label: 'Cấu hình',
            codeProps: {
                language: 'json',
            },
            disabled: true,
        },
        {
            type: 'switch',
            name: 'isActive',
            label: 'Trạng thái',
            switchProps: {
                placeholder: 'Trạng thái của nhà cung cấp',
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
    ];

    return (
        <Space size="middle" direction="vertical" className="w-full h-full">
            <CustomElement
                title="Danh sách nhà cung cấp"
                elementType={ElementType.TITLE}
                actions={[
                    <Button
                        type="primary"
                        key="add-cloud-data-provider"
                        icon={<Icon icon="lucide:plus" />}
                        onClick={() => setOpenCreateItemModal(true)}
                    >
                        Thêm nhà cung cấp
                    </Button>,
                ]}
            />

            <TableContainer
                columns={columns}
                actionItems={actionItems}
                resource="cloud-data-providers"
                tableContainerData={tableContainerData}
                filterSearch={{ placeholder: 'Tìm kiếm nhà cung cấp' }}
            />

            <CreateFormModal
                formFields={formFields}
                open={openCreateItemModal}
                title="Thêm mới nhà cung cấp"
                resource="cloud-data-providers"
                initialValues={{
                    isActive: true,
                    type: CloudDataProviderType.TELEGRAM,
                    config: JSON.stringify({
                        channelId: '',
                    }),
                }}
                onClose={() => {
                    setOpenCreateItemModal(false);
                    tableContainerData?.tableQuery?.refetch();
                }}
                onTransformValues={(values) => {
                    return {
                        ...values,
                        config: JSON.parse(values.config),
                    };
                }}
            />

            <EditFormModal
                id={editItemId ?? ''}
                formFields={formFields}
                resource="cloud-data-providers"
                title="Chỉnh sửa nhà cung cấp"
                onClose={() => {
                    setEditItemId(undefined);
                    tableContainerData?.tableQuery?.refetch();
                }}
            />
        </Space>
    );
};

export default CloudDataProvider;
