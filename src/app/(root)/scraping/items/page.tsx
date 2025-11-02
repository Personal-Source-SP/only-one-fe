'use client';

import { CreateFormModal, CustomElement, EditFormModal, TableContainer } from '@/components/custom';
import ImportData from '@/components/module/import-data';
import { DataImportType, ElementType, ProductMappingStatus } from '@/enums';
import { useTableContainer } from '@/hooks';
import { FormFieldItem, NDataProvider } from '@/interfaces';
import { Icon } from '@iconify/react';
import { Button, Space, Tag } from 'antd';
import { ColumnsType, ColumnType } from 'antd/es/table';
import dayjs from 'dayjs';
import { FC, useCallback, useState } from 'react';

const ItemPage: FC = () => {
    const [openCreateItemModal, setOpenCreateItemModal] = useState(false);
    const [openImportItemModal, setOpenImportItemModal] = useState(false);
    const [editItemId, setEditItemId] = useState<string | undefined>(undefined);

    const tableContainerData = useTableContainer({
        resource: 'items',
    });

    const displayMappingStatus = useCallback((mappingStatus: ProductMappingStatus) => {
        if (!mappingStatus) return '---';

        let color: string, text: string;

        switch (mappingStatus) {
            case ProductMappingStatus.MAPPED:
                color = '#52c41a';
                text = 'Đã ánh xạ';
                break;
            case ProductMappingStatus.UNMAPPED:
                color = '#bfbfbf';
                text = 'Chưa ánh xạ';
                break;
            case ProductMappingStatus.MAPPED_HAS_DATA:
                color = '#1890ff';
                text = 'Đã ánh xạ (có dữ liệu)';
                break;
            default:
                color = '#bfbfbf';
                text = mappingStatus;
        }

        return (
            <Tag color={color} className="text-sm font-medium">
                {text}
            </Tag>
        );
    }, []);

    const columns: ColumnsType<NDataProvider.IItem> = [
        {
            title: 'Tên thư mục',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
            sorter: true,
            width: '25%',
        },
        {
            key: 'mappingStatus',
            title: 'Trạng thái ánh xạ',
            dataIndex: 'mappingStatus',
            sorter: true,
            render: (mappingStatus: ProductMappingStatus) => displayMappingStatus(mappingStatus),
            width: '15%',
        },
        {
            key: 'code',
            title: 'Mã',
            align: 'center',
            dataIndex: 'code',
            render: (code: string) =>
                code ? (
                    <span>
                        <Tag color="blue" className="text-sm font-medium">
                            {code}
                        </Tag>
                    </span>
                ) : (
                    '---'
                ),
            width: '15%',
        },
        {
            key: 'tags',
            title: 'Tags',
            align: 'center',
            dataIndex: 'tags',
            render: (tags: string[]) =>
                tags?.map((tag) => (
                    <span key={tag}>
                        <Tag color="blue" className="text-sm font-medium">
                            {tag}
                        </Tag>
                    </span>
                )),
            width: '20%',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            sorter: true,
            render: (createdAt: Date) =>
                createdAt ? dayjs(createdAt).format('DD/MM/YYYY HH:mm:ss') : '---',
            width: '25%',
        },
    ];

    const importDataColumns: ColumnType<NDataProvider.IItem>[] = [
        {
            title: 'Tên đối tượng',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
            width: '50%',
        },
        {
            title: 'Mã',
            dataIndex: 'code',
            key: 'code',
            width: '15%',
            align: 'center',
            ellipsis: true,
        },
        {
            title: 'Trạng thái ánh xạ',
            dataIndex: 'mappingStatus',
            key: 'mappingStatus',
            align: 'center',
            width: '35%',
            render: (mappingStatus: ProductMappingStatus) => displayMappingStatus(mappingStatus),
        },
    ];

    const formFields: FormFieldItem[] = [
        {
            name: 'name',
            type: 'input',
            label: 'Tên đối tượng',
            rules: [
                { required: true, message: 'Vui lòng nhập tên đối tượng' },
                { max: 255, message: 'Tên đối tượng không được vượt quá 255 ký tự' },
            ],
        },
        {
            name: 'code',
            type: 'input',
            label: 'Mã',
            rules: [
                { required: true, message: 'Vui lòng nhập mã đối tượng' },
                { max: 20, message: 'Mã đối tượng không được vượt quá 20 ký tự' },
            ],
        },
        {
            name: 'tags',
            type: 'input',
            label: 'Tags',
            tooltip: 'Tags (cách nhau bằng dấu phẩy ",")',
            rules: [
                {
                    validator: (_: any, value: string) => {
                        if (
                            value &&
                            typeof value === 'string' &&
                            value.split(',').some((tag) => tag.trim().length === 0 && tag !== '')
                        ) {
                            return Promise.reject(new Error('Tag không được bỏ trống!'));
                        }
                        return Promise.resolve();
                    },
                },
            ],
            placeholder: 'Nhập các tag, mỗi tag cách nhau bằng dấu phẩy ","',
        },
    ];

    return (
        <Space size="middle" direction="vertical" className="w-full h-full">
            <CustomElement
                title="Danh sách đối tượng"
                elementType={ElementType.TITLE}
                actions={[
                    <Button
                        type="primary"
                        key="import-item"
                        icon={<Icon icon="lucide:file-text" />}
                        onClick={() => setOpenImportItemModal(true)}
                    >
                        Nhập đối tượng
                    </Button>,
                    <Button
                        type="primary"
                        key="add-item"
                        icon={<Icon icon="lucide:plus" />}
                        onClick={() => setOpenCreateItemModal(true)}
                    >
                        Thêm đối tượng
                    </Button>,
                ]}
            />

            <TableContainer
                resource="items"
                columns={columns}
                tableContainerData={tableContainerData}
                actionItems={[
                    {
                        key: 'edit',
                        label: 'Chỉnh sửa',
                        icon: <Icon icon="lucide:edit" />,
                        onClick: (record) => setEditItemId(record?.id),
                    },
                ]}
                filterSearch={{
                    placeholder: 'Tìm kiếm đối tượng',
                }}
            />

            <CreateFormModal
                resource="items"
                formFields={formFields}
                title="Thêm mới đối tượng"
                open={openCreateItemModal}
                onClose={() => {
                    setOpenCreateItemModal(false);
                    tableContainerData?.tableQuery?.refetch();
                }}
            />

            <EditFormModal
                resource="items"
                id={editItemId ?? ''}
                formFields={formFields}
                title="Chỉnh sửa đối tượng"
                onClose={() => {
                    setEditItemId(undefined);
                    tableContainerData?.tableQuery?.refetch();
                }}
            />

            {openImportItemModal && (
                <ImportData
                    key="import-item"
                    open={openImportItemModal}
                    dataType={DataImportType.ITEM}
                    onClose={() => setOpenImportItemModal(false)}
                    onSuccess={() => tableContainerData?.tableQuery?.refetch()}
                    columns={importDataColumns as unknown as ColumnType<Record<string, any>>[]}
                />
            )}
        </Space>
    );
};

export default ItemPage;
