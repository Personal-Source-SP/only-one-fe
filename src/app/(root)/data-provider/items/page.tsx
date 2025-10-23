'use client';

import { CustomElement, TableContainer } from '@/components/custom';
import { ItemModal } from '@/components/module/items';
import { ElementType, ProductMappingStatus } from '@/enums';
import { NDataProvider } from '@/interfaces';
import { Icon } from '@iconify/react';
import { useModalForm } from '@refinedev/antd';
import { HttpError } from '@refinedev/core';
import { Button, Space, Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { FC, useCallback, useState } from 'react';

const ItemPage: FC = () => {
    const [quantityRefetch, setQuantityRefetch] = useState(0);

    const {
        open: openCreateItemModal,
        show: showCreateItemModal,
        close: closeCreateItemModal,
        formProps: createItemFormProps,
        modalProps: createItemModalProps,
        formLoading: createItemFormLoading,
    } = useModalForm<NDataProvider.IItem, HttpError, Partial<NDataProvider.IItem>>({
        action: 'create',
        resource: 'items',
        autoResetForm: true,
        warnWhenUnsavedChanges: false,
    });

    const {
        open: openFolderModal,
        show: showFolderModal,
        close: closeFolderModal,
        formProps: folderModalFormProps,
        modalProps: folderModalModalProps,
        formLoading: folderModalFormLoading,
    } = useModalForm<NDataProvider.IItem, HttpError, Partial<NDataProvider.IItem>>({
        action: 'edit',
        resource: 'items',
        autoResetForm: true,
        warnWhenUnsavedChanges: false,
    });

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
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            sorter: true,
            render: (createdAt: Date) =>
                createdAt ? dayjs(createdAt).format('DD/MM/YYYY HH:mm:ss') : '---',
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
                        onClick={() => showCreateItemModal()}
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
                        onClick: (record) => showFolderModal(record?.id),
                    },
                ]}
                filterSearch={{
                    placeholder: 'Tìm kiếm đối tượng',
                }}
            />

            <ItemModal
                open={openCreateItemModal}
                onClose={closeCreateItemModal}
                formProps={createItemFormProps}
                isLoading={createItemFormLoading}
                modalProps={createItemModalProps}
                folderOptions={[]}
                onSubmit={() => {}}
            />
        </Space>
    );
};

export default ItemPage;
