'use client';

import { CreateFormModal, CustomElement, EditFormModal, TableContainer } from '@/components/custom';
import { ProcessScrapeData } from '@/components/module/data-provider';
import { CustomFilterType, DataProviderStatus, ElementType } from '@/enums';
import {
    useCustomMutationData,
    useSelectCloudDataProvider,
    useSelectDataProvider,
    useSelectItem,
    useTableContainer,
} from '@/hooks';
import { ActionTableItem, FilterItem, FormFieldItem, NDataProvider } from '@/interfaces';
import { formatDate } from '@/libs';
import { Icon } from '@iconify/react';
import { Button, Space, Switch } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useState } from 'react';

const DataProviderItemPage = () => {
    const [loading, setLoading] = useState(false);
    const [openCreateItemModal, setOpenCreateItemModal] = useState(false);
    const [editItemId, setEditItemId] = useState<string | undefined>(undefined);

    const [openProcessScrapeDataModal, setOpenProcessScrapeDataModal] = useState(false);
    const [selectedDataProviderItemIds, setSelectedDataProviderItemIds] = useState<string[]>([]);

    const { options: itemOptions } = useSelectItem();
    const { options: cloudDataProviderOptions } = useSelectCloudDataProvider();
    const { options: dataProviderOptions, query: dataProviderQuery } = useSelectDataProvider();

    const { handleCustomMutationData: handleUpdate } = useCustomMutationData();

    const tableContainerData = useTableContainer({
        resource: 'data-provider-items',
    });

    const columns: ColumnsType<NDataProvider.IDataProviderItem> = [
        {
            title: 'STT',
            key: 'index',
            dataIndex: 'index',
            align: 'center',
            width: 50,
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: 'Tên đối tượng / Nhà cung cấp / URL đối tượng',
            dataIndex: 'itemAndProviderAndUrl',
            key: 'itemAndProviderAndUrl',
            ellipsis: true,
            width: 200,
            render: (_: any, record: NDataProvider.IDataProviderItem) => {
                return (
                    <div className="text-sm">
                        <p>
                            <strong>Nhà cung cấp:</strong> {record?.dataProvider?.name ?? '---'}
                        </p>
                        <p>
                            <strong>URL đối tượng:</strong> {record?.itemUrl ?? '---'}
                        </p>
                        <p>
                            <strong>Đối tượng:</strong> {record?.item?.name ?? '---'}
                        </p>
                    </div>
                );
            },
        },
        {
            title: 'Ngày cào gần nhất',
            dataIndex: 'lastScrapedTimestamp',
            key: 'lastScrapedTimestamp',
            sorter: true,
            width: 150,
            render: (lastScrapedTimestamp: Date) => formatDate(lastScrapedTimestamp),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            sorter: true,
            width: 150,
            render: (createdAt: Date) => formatDate(createdAt),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            align: 'center',
            width: 100,
            render: (isActive: boolean, record: NDataProvider.IDataProviderItem) => (
                <Switch
                    size="small"
                    checked={isActive}
                    onChange={(checked) => handleSwitchStatus(record?.id ?? '', checked)}
                />
            ),
        },
        {
            title: 'Lưu vào kho dữ liệu',
            dataIndex: 'isSavedToCloudData',
            key: 'isSavedToCloudData',
            align: 'center',
            width: 100,
            render: (isSavedToCloudData: boolean, record: NDataProvider.IDataProviderItem) => (
                <Space>
                    <Switch size="small" checked={isSavedToCloudData} disabled />
                    <p>{record?.cloudDataProvider?.name ?? '---'}</p>
                </Space>
            ),
        },
    ];

    const formFields: FormFieldItem[] = [
        {
            name: 'itemId',
            type: 'select',
            label: 'Tên đối tượng',
            rules: [{ required: true, message: 'Vui lòng chọn đối tượng' }],
            selectProps: {
                options: itemOptions ?? [],
            },
        },
        {
            type: 'select',
            name: 'dataProviderId',
            label: 'Tên nhà cung cấp',
            rules: [{ required: true, message: 'Vui lòng chọn nhà cung cấp' }],
            onChange: (value, form) => {
                const dataProvider = dataProviderQuery?.data?.data?.find(
                    (option) => option.id === value,
                );
                form?.setFieldValue('itemUrl', dataProvider?.baseUrl ?? '');
            },
            selectProps: {
                options: dataProviderOptions ?? [],
            },
        },
        {
            name: 'itemUrl',
            type: 'input',
            label: 'URL cơ sở',
            rules: [{ required: true, message: 'Vui lòng nhập URL đối tượng' }],
        },
        {
            type: 'select',
            name: 'cloudDataProviderId',
            label: 'Nhà cung cấp kho dữ liệu',
            selectProps: {
                options: cloudDataProviderOptions ?? [],
            },
        },
        {
            type: 'switch',
            name: 'autoProcessScraping',
            label: 'Tự động cào dữ liệu',
            switchProps: {
                placeholder: 'Tự động cào khi thêm đối tượng nhà cung cấp',
            },
        },
        {
            type: 'switch',
            name: 'checkDuplicateData',
            label: 'Kiểm tra dữ liệu trùng lặp',
            switchProps: {
                placeholder: 'Kiểm tra dữ liệu trùng lặp khi cào dữ liệu',
            },
        },
        {
            type: 'switch',
            name: 'isSavedToCloudData',
            label: 'Lưu vào kho dữ liệu',
            switchProps: {
                placeholder: 'Lưu vào kho dữ liệu khi cào dữ liệu',
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

    const customFilterItems: FilterItem[] = [
        {
            span: 6,
            operation: 'in',
            mode: 'multiple',
            title: 'Nhà cung cấp',
            field: 'dataProviderId',
            type: CustomFilterType.SELECT,
            options: dataProviderOptions ?? [],
        },
        {
            span: 6,
            operation: 'in',
            field: 'itemId',
            mode: 'multiple',
            title: 'Đối tượng',
            type: CustomFilterType.SELECT,
            options: itemOptions ?? [],
        },
    ];

    const handleSwitchStatus = (id: string, active: boolean) => {
        setLoading(true);

        handleUpdate({
            values: {},
            method: 'put',
            url: `data-provider-items/${id}/switch-status/${active}`,
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
                loading={loading}
                columns={columns}
                actionItems={actionItems}
                resource="data-provider-items"
                customFilterItems={customFilterItems}
                tableContainerData={tableContainerData}
                filterSearch={{ placeholder: 'Tìm kiếm đối tượng nhà cung cấp', span: 12 }}
                onRowSelectionChange={(selectedRows: NDataProvider.IDataProviderItem[]) => {
                    const dataProviderItemsIds = selectedRows
                        ?.filter((item) => item.dataProvider?.status === DataProviderStatus.READY)
                        ?.map((item) => item.id ?? '');

                    setSelectedDataProviderItemIds(dataProviderItemsIds ?? []);
                }}
                onDisableRowSelection={(record: NDataProvider.IDataProviderItem) =>
                    record.dataProvider?.status !== DataProviderStatus.READY || !record.isActive
                }
            />

            <CreateFormModal
                formFields={formFields}
                open={openCreateItemModal}
                resource="data-provider-items"
                title="Thêm mới đối tượng nhà cung cấp"
                initialValues={{
                    autoProcessScraping: true,
                    checkDuplicateData: true,
                }}
                onClose={() => {
                    setOpenCreateItemModal(false);
                    tableContainerData?.tableQuery?.refetch();
                }}
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
            />

            {openProcessScrapeDataModal && (
                <ProcessScrapeData
                    key="process-scrape-data"
                    open={openProcessScrapeDataModal}
                    onClose={() => setOpenProcessScrapeDataModal(false)}
                    selectedDataProviderItemIds={selectedDataProviderItemIds}
                />
            )}
        </Space>
    );
};

export default DataProviderItemPage;
