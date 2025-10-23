'use client';

import { CreateFormModal, CustomElement, EditFormModal, TableContainer } from '@/components/custom';
import { ElementType, ProductMappingStatus } from '@/enums';
import { FormFieldItem, NDataProvider } from '@/interfaces';
import { Icon } from '@iconify/react';
import { Button, Space, Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { FC, useCallback, useState } from 'react';

const ItemPage: FC = () => {
    const [quantityRefetch, setQuantityRefetch] = useState(0);

    const [openCreateItemModal, setOpenCreateItemModal] = useState(false);
    const [editItemId, setEditItemId] = useState<string | undefined>(undefined);

    const displayMappingStatus = useCallback((mappingStatus: ProductMappingStatus) => {
        if (!mappingStatus) return '---';

        let color: string, text: string;

        switch (mappingStatus) {
            case ProductMappingStatus.MAPPED:
                color = 'success';
                text = 'Đã ánh xạ';
                break;
            case ProductMappingStatus.UNMAPPED:
                color = 'default';
                text = 'Chưa ánh xạ';
                break;
            case ProductMappingStatus.MAPPED_HAS_PRICE:
                color = 'processing';
                text = 'Đã ánh xạ (có giá)';
                break;
            default:
                color = 'default';
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
        },
        {
            key: 'mappingStatus',
            title: 'Trạng thái ánh xạ',
            dataIndex: 'mappingStatus',
            sorter: true,
            render: (mappingStatus: ProductMappingStatus) => displayMappingStatus(mappingStatus),
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
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            sorter: true,
            render: (createdAt: Date) =>
                createdAt ? dayjs(createdAt).format('DD/MM/YYYY HH:mm:ss') : '---',
        },
    ];

    const formFields: FormFieldItem[] = [
        {
            name: 'name',
            type: 'input',
            label: 'Tên đối tượng',
            rules: [{ required: true, message: 'Vui lòng nhập tên đối tượng' }],
        },
        {
            name: 'code',
            type: 'input',
            label: 'Mã',
            rules: [{ required: true, message: 'Vui lòng nhập mã đối tượng' }],
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
                        key="add-item"
                        icon={<Icon icon="lucide:plus" />}
                        onClick={() => setOpenCreateItemModal(true)}
                    >
                        Thêm đối tượng
                    </Button>,
                ]}
            />

            <TableContainer
                columns={columns}
                resource="items"
                quantityRefetch={quantityRefetch}
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
                    setQuantityRefetch(quantityRefetch + 1);
                }}
            />

            <EditFormModal
                resource="items"
                id={editItemId ?? ''}
                formFields={formFields}
                title="Chỉnh sửa đối tượng"
                onClose={() => {
                    setEditItemId(undefined);
                    setQuantityRefetch(quantityRefetch + 1);
                }}
            />
        </Space>
    );
};

export default ItemPage;
