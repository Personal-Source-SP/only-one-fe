'use client';

import { CreateFormModal, CustomElement, EditFormModal, TableContainer } from '@/components/custom';
import { ProcessScrapeData } from '@/components/module/data-provider';
import { DataProviderStatus, ElementType } from '@/enums';
import { useSelectDataProvider, useSelectItem, useTableContainer } from '@/hooks';
import { ActionTableItem, FormFieldItem, NDataProvider } from '@/interfaces';
import { buildUrl } from '@/libs';
import { Icon } from '@iconify/react';
import { Button, Space } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { FC, useState } from 'react';

const DataProviderItemPage: FC = () => {
    const [openCreateItemModal, setOpenCreateItemModal] = useState(false);
    const [editItemId, setEditItemId] = useState<string | undefined>(undefined);
    const [selectBaseUrl, setSelectBaseUrl] = useState<string | undefined>(undefined);

    const [openProcessScrapeDataModal, setOpenProcessScrapeDataModal] = useState(false);
    const [selectedDataProviderItemIds, setSelectedDataProviderItemIds] = useState<string[]>([]);

    const { options: itemOptions } = useSelectItem();
    const { options: dataProviderOptions, query: dataProviderQuery } = useSelectDataProvider();

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
            onChange: (value) => {
                const dataProvider = dataProviderQuery?.data?.data?.find(
                    (option) => option.id === value,
                );
                setSelectBaseUrl(dataProvider?.baseUrl ?? '');
            },
        },
        {
            name: 'itemUrl',
            type: 'input',
            label: 'URL cơ sở',
            addonBefore: selectBaseUrl ? <span>{selectBaseUrl}</span> : undefined,
            rules: [{ required: true, message: 'Vui lòng nhập URL đối tượng' }],
        },
    ];

    const actionItems: ActionTableItem[] = [
        {
            key: 'edit',
            label: 'Chỉnh sửa',
            icon: <Icon icon="lucide:edit" />,
            onClick: (record) => {
                setEditItemId(record?.id);
                setSelectBaseUrl(record?.dataProvider?.baseUrl);
            },
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
                        key="scrape-data"
                        icon={<Icon icon="lucide:file-text" />}
                        onClick={() => setOpenProcessScrapeDataModal(true)}
                    >
                        Cào dữ liệu
                    </Button>,
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
                actionItems={actionItems}
                resource="data-provider-items"
                tableContainerData={tableContainerData}
                filterSearch={{ placeholder: 'Tìm kiếm đối tượng nhà cung cấp' }}
                onRowSelectionChange={(selectedRows: NDataProvider.IDataProviderItem[]) => {
                    const dataProviderItemsIds = selectedRows
                        ?.filter((item) => item.dataProvider?.status === DataProviderStatus.READY)
                        ?.map((item) => item.id ?? '');

                    setSelectedDataProviderItemIds(dataProviderItemsIds ?? []);
                }}
                onDisableRowSelection={(record: NDataProvider.IDataProviderItem) =>
                    record.dataProvider?.status !== DataProviderStatus.READY
                }
            />

            <CreateFormModal
                formFields={formFields}
                open={openCreateItemModal}
                resource="data-provider-items"
                title="Thêm mới đối tượng nhà cung cấp"
                onClose={() => {
                    setOpenCreateItemModal(false);
                    tableContainerData?.tableQuery?.refetch();
                }}
                onTransformValues={(values) => ({
                    ...values,
                    itemUrl: buildUrl(values.itemUrl, selectBaseUrl ?? ''),
                })}
            />

            <EditFormModal
                id={editItemId ?? ''}
                formFields={formFields}
                resource="data-provider-items"
                title="Chỉnh sửa đối tượng nhà cung cấp"
                onClose={() => {
                    setEditItemId(undefined);
                    tableContainerData?.tableQuery?.refetch();
                }}
                onTransformValues={(values) => ({
                    ...values,
                    itemUrl: buildUrl(values.itemUrl, selectBaseUrl ?? ''),
                })}
            />

            {openProcessScrapeDataModal && (
                <ProcessScrapeData
                    key="process-scrape-data"
                    open={openProcessScrapeDataModal}
                    selectedDataProviderItemIds={selectedDataProviderItemIds}
                    onClose={() => {
                        setOpenProcessScrapeDataModal(false);
                    }}
                />
            )}
        </Space>
    );
};

export default DataProviderItemPage;
