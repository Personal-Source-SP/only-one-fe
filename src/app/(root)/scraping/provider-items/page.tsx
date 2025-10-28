'use client';

import { CreateFormModal, CustomElement, EditFormModal, TableContainer } from '@/components/custom';
import { ElementType } from '@/enums';
import { useSelectDataProvider, useSelectItem, useTableContainer } from '@/hooks';
import { FormFieldItem, NDataProvider } from '@/interfaces';
import { Icon } from '@iconify/react';
import { Button, Space } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { FC, useState } from 'react';

const DataProviderItemPage: FC = () => {
    const [openCreateItemModal, setOpenCreateItemModal] = useState(false);
    const [editItemId, setEditItemId] = useState<string | undefined>(undefined);

    const { options: itemOptions } = useSelectItem();
    const { options: dataProviderOptions } = useSelectDataProvider();

    const tableContainerData = useTableContainer({
        resource: 'data-provider-items',
    });

    const columns: ColumnsType<NDataProvider.IDataProviderItem> = [
        {
            title: 'Tên đối tượng',
            dataIndex: 'item',
            key: 'item',
            ellipsis: true,
            sorter: true,
            render: (item: NDataProvider.IItem) => item?.name ?? '---',
        },
        {
            title: 'Tên nhà cung cấp',
            dataIndex: 'dataProvider',
            key: 'dataProvider',
            ellipsis: true,
            sorter: true,
            render: (dataProvider: NDataProvider.IDataProvider) => dataProvider?.name ?? '---',
        },
        {
            title: 'URL đối tượng',
            dataIndex: 'itemUrl',
            key: 'itemUrl',
            ellipsis: true,
            sorter: true,
            render: (itemUrl: string) => itemUrl ?? '---',
        },
        {
            title: 'Ngày scrape gần nhất',
            dataIndex: 'lastScrapedTimestamp',
            key: 'lastScrapedTimestamp',
            sorter: true,
            render: (lastScrapedTimestamp: Date) =>
                lastScrapedTimestamp
                    ? dayjs(lastScrapedTimestamp).format('DD/MM/YYYY HH:mm:ss')
                    : '---',
        },
    ];

    const formFields: FormFieldItem[] = [
        {
            name: 'itemId',
            type: 'select',
            label: 'Tên đối tượng',
            options: itemOptions ?? [],
            rules: [{ required: true, message: 'Vui lòng chọn đối tượng' }],
        },
        {
            type: 'select',
            name: 'dataProviderId',
            label: 'Tên nhà cung cấp',
            options: dataProviderOptions ?? [],
            rules: [{ required: true, message: 'Vui lòng chọn nhà cung cấp' }],
            onChange: (value, form) => {
                form?.setFieldValue('itemUrl', value?.baseUrl ?? '');
            },
        },
        {
            name: 'itemUrl',
            type: 'input',
            label: 'URL cơ sở',
            rules: [
                { required: true, message: 'Vui lòng nhập URL đối tượng' },
                { type: 'url', message: 'URL đối tượng không hợp lệ' },
            ],
        },
    ];

    return (
        <Space size="middle" direction="vertical" className="w-full h-full">
            <CustomElement
                title="Danh sách đối tượng nhà cung cấp"
                elementType={ElementType.TITLE}
                actions={[
                    <Button
                        type="primary"
                        key="add-data-provider-item"
                        icon={<Icon icon="lucide:plus" />}
                        onClick={() => setOpenCreateItemModal(true)}
                    >
                        Thêm đối tượng nhà cung cấp
                    </Button>,
                ]}
            />

            <TableContainer
                columns={columns}
                resource="data-provider-items"
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
                    placeholder: 'Tìm kiếm đối tượng nhà cung cấp',
                }}
            />

            <CreateFormModal
                resource="data-provider-items"
                formFields={formFields}
                title="Thêm mới đối tượng"
                open={openCreateItemModal}
                onClose={() => {
                    setOpenCreateItemModal(false);
                    tableContainerData?.tableQuery?.refetch();
                }}
            />

            <EditFormModal
                resource="data-provider-items"
                id={editItemId ?? ''}
                formFields={formFields}
                title="Chỉnh sửa đối tượng"
                onClose={() => {
                    setEditItemId(undefined);
                    tableContainerData?.tableQuery?.refetch();
                }}
            />
        </Space>
    );
};

export default DataProviderItemPage;
