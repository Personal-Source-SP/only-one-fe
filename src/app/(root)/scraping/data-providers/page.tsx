'use client';

import { CreateFormModal, CustomElement, EditFormModal, TableContainer } from '@/components/custom';
import { ProcessScrapeData, ScrapeSetting } from '@/components/module/data-provider';
import {
    CustomFilterType,
    DataProviderSearchStatus,
    DataProviderStatus,
    ElementType,
} from '@/enums';
import { ActionTableItem, FilterItem, FormFieldItem, NDataProvider } from '@/interfaces';
import { Icon } from '@iconify/react';
import { useModalForm } from '@refinedev/antd';
import { HttpError, useSelect } from '@refinedev/core';
import { Button, Space, Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { FC, useCallback, useState } from 'react';

const DataProviderPage: FC = () => {
    const [quantityRefetch, setQuantityRefetch] = useState(0);
    const [openCreateItemModal, setOpenCreateItemModal] = useState(false);
    const [editItemId, setEditItemId] = useState<string | undefined>(undefined);
    const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

    const [openProcessScrapeDataModal, setOpenProcessScrapeDataModal] = useState(false);
    const [selectedRows, setSelectedRows] = useState<NDataProvider.IDataProvider[]>([]);

    const { options: providerItems } = useSelect<NDataProvider.IDataProviderItem>({
        resource: `data-provider-items/data-provider/${selectedId}`,
        optionValue: (item: NDataProvider.IDataProviderItem) => item.itemUrl ?? '',
        optionLabel: (item: NDataProvider.IDataProviderItem) => item.itemUrl ?? '',
        queryOptions: {
            enabled: !!selectedId,
        },
    });

    const { show, close, formProps, modalProps, formLoading } = useModalForm<
        NDataProvider.IDataProvider,
        HttpError,
        Partial<NDataProvider.IDataProvider>
    >({
        action: 'edit',
        resource: 'data-providers',
        autoResetForm: true,
        warnWhenUnsavedChanges: false,
    });

    const displayStatus = useCallback((status: DataProviderStatus) => {
        if (!status) return '---';

        let color: string, text: string;

        switch (status) {
            case DataProviderStatus.READY:
                color = 'success';
                text = 'Sẵn sàng';
                break;
            case DataProviderStatus.TESTING:
                color = 'processing';
                text = 'Đang kiểm tra';
                break;
            case DataProviderStatus.UNCONFIGURED:
                color = 'default';
                text = 'Chưa cấu hình';
                break;
            case DataProviderStatus.ERROR:
                color = 'error';
                text = 'Lỗi';
                break;
            default:
                color = 'default';
                text = status;
        }

        return (
            <Tag color={color} className="text-sm font-medium">
                {text}
            </Tag>
        );
    }, []);

    const columns: ColumnsType<NDataProvider.IDataProvider> = [
        {
            title: 'Tên nhà cung cấp',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
            sorter: true,
        },
        {
            title: 'Mã nhà cung cấp',
            dataIndex: 'identifier',
            key: 'identifier',
            ellipsis: true,
            sorter: true,
        },
        {
            title: 'URL cơ sở',
            dataIndex: 'baseUrl',
            key: 'baseUrl',
            ellipsis: true,
            sorter: true,
        },
        {
            key: 'status',
            title: 'Trạng thái',
            dataIndex: 'status',
            render: (status: DataProviderStatus) => displayStatus(status),
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
            key: 'targetConfig',
            title: 'Cấu hình dữ liệu',
            align: 'center',
            dataIndex: 'targetConfig',
            render: (targetConfig: NDataProvider.ITargetConfig) =>
                targetConfig ? (
                    <Icon icon="lucide:check" className="w-full" />
                ) : (
                    <Icon icon="lucide:x" className="w-full" />
                ),
        },
        {
            key: 'searchConfig',
            title: 'Cấu hình tìm kiếm',
            align: 'center',
            dataIndex: 'searchConfig',
            render: (searchConfig: NDataProvider.ISearchConfig) =>
                searchConfig ? (
                    <Icon icon="lucide:check" className="w-full" />
                ) : (
                    <Icon icon="lucide:x" className="w-full" />
                ),
        },
    ];

    const formFields: FormFieldItem[] = [
        {
            span: 12,
            name: 'name',
            type: 'input',
            label: 'Tên nhà cung cấp',
            rules: [
                { required: true, message: 'Vui lòng nhập tên nhà cung cấp' },
                { max: 255, message: 'Tên nhà cung cấp không được vượt quá 255 ký tự' },
            ],
        },
        {
            span: 12,
            name: 'identifier',
            type: 'input',
            label: 'Mã nhà cung cấp',
            rules: [
                { max: 20, message: 'Mã nhà cung cấp không được vượt quá 20 ký tự' },
                {
                    pattern: /^[a-z0-9-]+$/,
                    message: 'Mã nhà cung cấp chỉ được chứa chữ cái thường, số và dấu gạch ngang',
                },
            ],
        },
        {
            name: 'baseUrl',
            type: 'input',
            label: 'URL cơ sở',
            rules: [
                { required: true, message: 'Vui lòng nhập URL cơ sở' },
                { type: 'url', message: 'URL cơ sở không hợp lệ' },
                { pattern: /^.*[^/]$/, message: 'URL cơ sở không được kết thúc bằng /' },
            ],
        },
    ];

    const customFilterItems: FilterItem[] = [
        {
            span: 6,
            showSearch: true,
            allowClear: true,
            field: 'status',
            title: 'Trạng thái cào dữ liệu',
            type: CustomFilterType.SELECT,
            options: [
                { label: 'Sẵn sàng', value: DataProviderStatus.READY },
                { label: 'Lỗi', value: DataProviderStatus.ERROR },
                { label: 'Đang kiểm tra', value: DataProviderStatus.TESTING },
                { label: 'Chưa cấu hình', value: DataProviderStatus.UNCONFIGURED },
            ],
        },
        {
            span: 6,
            showSearch: true,
            allowClear: true,
            title: 'Trạng thái tìm kiếm',
            field: 'searchStatus',
            type: CustomFilterType.SELECT,
            options: [
                { label: 'Sẵn sàng', value: DataProviderSearchStatus.READY },
                { label: 'Lỗi', value: DataProviderSearchStatus.ERROR },
                { label: 'Đang kiểm tra', value: DataProviderSearchStatus.TESTING },
                {
                    label: 'Chưa cấu hình',
                    value: DataProviderSearchStatus.UNCONFIGURED,
                },
            ],
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
            key: 'scrape-unconfigured',
            label: 'Cấu hình dữ liệu',
            icon: <Icon icon="lucide:settings-2" />,
            onClick: (record) => {
                setSelectedId(record?.id);
                show(record?.id);
            },
        },
        {
            key: 'search-configured',
            label: 'Câu hình tìm kiếm',
            icon: <Icon icon="lucide:search-code" />,
            onClick: (record) => {
                setSelectedId(record?.id);
                show(record?.id);
            },
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
                        key="scrape-data"
                        icon={<Icon icon="lucide:file-text" />}
                        onClick={() => setOpenProcessScrapeDataModal(true)}
                    >
                        Cào dữ liệu
                    </Button>,
                    <Button
                        type="primary"
                        key="add-data-provider"
                        icon={<Icon icon="lucide:plus" />}
                        onClick={() => setOpenCreateItemModal(true)}
                    >
                        Thêm nhà cung cấp
                    </Button>,
                ]}
            />

            <TableContainer
                columns={columns}
                resource="data-providers"
                actionItems={actionItems}
                quantityRefetch={quantityRefetch}
                customFilterItems={customFilterItems}
                filterSearch={{ placeholder: 'Tìm kiếm nhà cung cấp', span: 12 }}
                onRowSelectionChange={(selectedRows: NDataProvider.IDataProvider[]) => {
                    const dataProviderReady = selectedRows.filter(
                        (item) => item.status === DataProviderStatus.READY,
                    );
                    setSelectedRows(dataProviderReady ?? []);
                }}
                onDisableRowSelection={(record: NDataProvider.IDataProvider) =>
                    record.status !== DataProviderStatus.READY
                }
            />

            <CreateFormModal
                resource="data-providers"
                formFields={formFields}
                title="Thêm mới đối tượng"
                open={openCreateItemModal}
                onClose={() => {
                    setOpenCreateItemModal(false);
                    setQuantityRefetch(quantityRefetch + 1);
                }}
            />

            <EditFormModal
                resource="data-providers"
                id={editItemId ?? ''}
                formFields={formFields}
                title="Chỉnh sửa đối tượng"
                onClose={() => {
                    setEditItemId(undefined);
                    setQuantityRefetch(quantityRefetch + 1);
                }}
            />

            <ScrapeSetting
                key="scrape-setting"
                formProps={formProps}
                modalProps={modalProps}
                formLoading={formLoading}
                dataProviderItemOptions={providerItems}
                onClose={() => {
                    close();
                    setSelectedId(undefined);
                    setQuantityRefetch(quantityRefetch + 1);
                }}
            />

            <ProcessScrapeData
                key="process-scrape-data"
                open={openProcessScrapeDataModal}
                dataProviders={selectedRows ?? []}
                onClose={() => {
                    setOpenProcessScrapeDataModal(false);
                }}
            />
        </Space>
    );
};

export default DataProviderPage;
