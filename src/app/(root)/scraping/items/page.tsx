'use client';

import {
    CreateFormDialog,
    DataTableContainer,
    EditFormDialog,
    StatusTag,
} from '@/components/common';
import { ColumnType, ColumnsType, CustomButton, CustomSpace, CustomTag } from '@/components/custom';
import { ProcessScrapeData } from '@/components/module/data-provider';
import { ImportData } from '@/components/module/import-data';
import { DataImportType, ProductMappingStatus } from '@/enums';
import { useTableContainer } from '@/hooks';
import { FormFieldItem, NDataProvider } from '@/interfaces';
import { formatDate } from '@/libs';
import { Icon } from '@iconify/react';
import { ReactNode, useState } from 'react';

const ItemPage = () => {
    const [openCreateItemModal, setOpenCreateItemModal] = useState(false);
    const [openImportItemModal, setOpenImportItemModal] = useState(false);
    const [editItemId, setEditItemId] = useState<string | undefined>(undefined);

    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
    const [openProcessScrapeDataModal, setOpenProcessScrapeDataModal] = useState(false);

    const tableContainerData = useTableContainer({
        resource: 'items',
    });

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
            render: (mappingStatus: ProductMappingStatus) => <StatusTag status={mappingStatus} />,
            width: '15%',
        },
        {
            key: 'code',
            title: 'Mã',
            align: 'center',
            dataIndex: 'code',
            render: (code: string) => <StatusTag status={code} />,
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
                        <CustomTag color="blue" className="text-sm font-medium">
                            {tag}
                        </CustomTag>
                    </span>
                )),
            width: '20%',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            sorter: true,
            render: (createdAt: Date) => formatDate(createdAt),
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
            render: (mappingStatus: ProductMappingStatus) => <StatusTag status={mappingStatus} />,
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
                            return Promise.reject(new Error('CustomTag không được bỏ trống!'));
                        }
                        return Promise.resolve();
                    },
                },
            ],
            inputProps: {
                placeholder: 'Nhập các tag, mỗi tag cách nhau bằng dấu phẩy ","',
            },
        },
    ];

    const actionButtons: ReactNode[] = [
        <CustomButton
            type="primary"
            key="scrape-data"
            title="Cào dữ liệu"
            icon={<Icon icon="lucide:file-text" />}
            onClick={() => setOpenProcessScrapeDataModal(true)}
        />,
        <CustomButton
            type="primary"
            key="import-item"
            title="Nhập đối tượng"
            icon={<Icon icon="lucide:file-text" />}
            onClick={() => setOpenImportItemModal(true)}
        />,
        <CustomButton
            type="primary"
            key="add-item"
            title="Thêm đối tượng"
            icon={<Icon icon="lucide:plus" />}
            onClick={() => setOpenCreateItemModal(true)}
        />,
    ];

    return (
        <>
            <DataTableContainer
                resource="items"
                columns={columns}
                title="Danh sách đối tượng"
                description="Quản lý các đối tượng được cào"
                actionButtons={actionButtons}
                tableContainerData={tableContainerData}
                filterSearch={{ placeholder: 'Tìm kiếm đối tượng' }}
                actionItems={[
                    {
                        key: 'edit',
                        label: 'Chỉnh sửa',
                        icon: <Icon icon="lucide:edit" />,
                        onClick: (record) => setEditItemId(record?.id),
                    },
                ]}
                onRowSelectionChange={(selectedRows: NDataProvider.IDataProviderItem[]) => {
                    const itemIds = selectedRows?.map((item) => item.id ?? '');
                    setSelectedItemIds(itemIds ?? []);
                }}
            />

            <CreateFormDialog
                resource="items"
                formFields={formFields}
                title="Thêm mới đối tượng"
                open={openCreateItemModal}
                onClose={() => {
                    setOpenCreateItemModal(false);
                    tableContainerData?.tableQuery?.refetch();
                }}
            />

            <EditFormDialog
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

            {openProcessScrapeDataModal && (
                <ProcessScrapeData
                    key="process-scrape-data"
                    open={openProcessScrapeDataModal}
                    selectedItemIds={selectedItemIds}
                    onClose={() => setOpenProcessScrapeDataModal(false)}
                />
            )}
        </>
    );
};

export default ItemPage;
