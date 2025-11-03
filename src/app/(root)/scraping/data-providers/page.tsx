'use client';

import { CreateFormModal, CustomElement, EditFormModal, TableContainer } from '@/components/custom';
import {
    DisplayDataProviderStatus,
    ProcessScrapeData,
    ScrapeSetting,
} from '@/components/module/data-provider';
import ImportData from '@/components/module/import-data';
import {
    CustomFilterType,
    DataImportType,
    DataProviderSearchStatus,
    DataProviderStatus,
    ElementType,
} from '@/enums';
import {
    useCustomModal,
    useSelectDataProvider,
    useSelectDataProviderItem,
    useTableContainer,
} from '@/hooks';
import { ActionTableItem, FilterItem, FormFieldItem, NDataProvider } from '@/interfaces';
import { Icon } from '@iconify/react';
import { Button, Space } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { ColumnType } from 'antd/lib/table';
import dayjs from 'dayjs';
import { FC, useState } from 'react';

const DataProviderPage: FC = () => {
    const [openCreateItemModal, setOpenCreateItemModal] = useState(false);
    const [openImportItemModal, setOpenImportItemModal] = useState(false);

    const [editItemId, setEditItemId] = useState<string | undefined>(undefined);
    const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

    const [openProcessScrapeDataModal, setOpenProcessScrapeDataModal] = useState(false);
    const [selectedDataProviderIds, setSelectedDataProviderIds] = useState<string[]>([]);

    const tableContainerData = useTableContainer({
        resource: 'data-providers',
    });

    const { options: dataProviderItems } = useSelectDataProviderItem({
        id: selectedId,
    });

    const { options: dataProviders, query: dataProviderQuery } = useSelectDataProvider();

    const modalPropsData = useCustomModal({
        action: 'edit',
        resource: 'data-providers',
    });

    const columns: ColumnsType<NDataProvider.IDataProvider> = [
        {
            title: 'Tên',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
            sorter: true,
            width: '15%',
        },
        {
            title: 'Mã',
            dataIndex: 'identifier',
            key: 'identifier',
            ellipsis: true,
            sorter: true,
            width: '10%',
        },
        {
            title: 'URL cơ sở',
            dataIndex: 'baseUrl',
            key: 'baseUrl',
            ellipsis: true,
            sorter: true,
            width: '20%',
        },
        {
            key: 'status',
            title: 'Trạng thái',
            dataIndex: 'status',
            render: (status: DataProviderStatus) => <DisplayDataProviderStatus status={status} />,
            width: '10%',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            sorter: true,
            render: (createdAt: Date) =>
                createdAt ? dayjs(createdAt).format('DD/MM/YYYY HH:mm:ss') : '---',
            width: '20%',
        },
        {
            key: 'targetConfig',
            title: 'Cào',
            align: 'center',
            dataIndex: 'targetConfig',
            render: (targetConfig: NDataProvider.ITargetConfig) =>
                targetConfig ? (
                    <Icon icon="lucide:check" className="w-full" />
                ) : (
                    <Icon icon="lucide:x" className="w-full" />
                ),
            width: '10%',
        },
        {
            key: 'searchConfig',
            title: 'Tìm kiếm',
            align: 'center',
            dataIndex: 'searchConfig',
            render: (searchConfig: NDataProvider.ISearchConfig) =>
                searchConfig ? (
                    <Icon icon="lucide:check" className="w-full" />
                ) : (
                    <Icon icon="lucide:x" className="w-full" />
                ),
            width: '15%',
        },
    ];

    const importDataColumns: ColumnType<NDataProvider.IImportDataProvider>[] = [
        {
            title: 'Tên nhà cung cấp',
            dataIndex: 'dataProviderName',
            key: 'dataProviderName',
            ellipsis: true,
            width: '25%',
        },
        {
            title: 'Mã nhà cung cấp',
            dataIndex: 'dataProviderIdentifier',
            key: 'dataProviderIdentifier',
            align: 'center',
            ellipsis: true,
            width: '15%',
        },
        {
            title: 'URL đối tượng',
            dataIndex: 'itemUrl',
            key: 'itemUrl',
            align: 'center',
            width: '30%',
        },
        {
            title: 'Tên đối tượng',
            dataIndex: 'itemName',
            key: 'itemName',
            ellipsis: true,
            width: '20%',
        },
        {
            title: 'Mã đối tượng',
            dataIndex: 'itemCode',
            key: 'itemCode',
            align: 'center',
            ellipsis: true,
            width: '10%',
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
                { required: true, message: 'Vui lòng nhập mã nhà cung cấp' },
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
                {
                    validator: (_, value) => {
                        if (!value) return Promise.resolve();
                        if (!/^.*[^/]$/.test(value)) {
                            return Promise.reject('URL cơ sở không được kết thúc bằng /');
                        }
                        return Promise.resolve();
                    },
                },
                {
                    validator: (_, value) => {
                        if (!value) return Promise.resolve();
                        if (!/^(?!.*www\.).*$/.test(value)) {
                            return Promise.reject('URL cơ sở không được chứa www');
                        }
                        return Promise.resolve();
                    },
                },
            ],
        },
        {
            type: 'select',
            name: 'parentId',
            label: 'Nhà cung cấp cha',
            options: dataProviders ?? [],
            onChange: (value, form) => {
                const parentDataProvider = dataProviderQuery?.data?.data?.find(
                    (item) => item.id === value,
                );

                form?.setFieldValue('identifier', parentDataProvider?.identifier ?? '');
            },
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
            icon: <Icon icon="tabler:edit" />,
            onClick: (record) => setEditItemId(record?.id),
        },
        {
            key: 'scrape-unconfigured',
            label: 'Cấu hình dữ liệu',
            icon: <Icon icon="tabler:database-cog" />,
            onClick: (record) => {
                setSelectedId(record?.id);
                modalPropsData?.show?.(record?.id);
            },
        },
        {
            key: 'search-configured',
            label: 'Cấu hình tìm kiếm',
            icon: <Icon icon="tabler:search" />,
            onClick: (record) => {
                setSelectedId(record?.id);
                modalPropsData?.show?.(record?.id);
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
                        key="import-data-provider"
                        icon={<Icon icon="lucide:file-text" />}
                        onClick={() => setOpenImportItemModal(true)}
                    >
                        Nhập nhà cung cấp
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
                customFilterItems={customFilterItems}
                tableContainerData={tableContainerData}
                filterSearch={{ placeholder: 'Tìm kiếm nhà cung cấp', span: 12 }}
                onRowSelectionChange={(selectedRows: NDataProvider.IDataProvider[]) => {
                    const dataProviderIds = selectedRows
                        ?.filter((item) => item.status === DataProviderStatus.READY)
                        ?.map((item) => item.id ?? '');

                    setSelectedDataProviderIds(dataProviderIds ?? []);
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
                    tableContainerData?.tableQuery?.refetch();
                }}
            />

            <EditFormModal
                resource="data-providers"
                id={editItemId ?? ''}
                formFields={formFields}
                title="Chỉnh sửa đối tượng"
                onClose={() => {
                    setEditItemId(undefined);
                    tableContainerData?.tableQuery?.refetch();
                }}
            />

            <ScrapeSetting
                key="scrape-setting"
                modalPropsData={modalPropsData}
                dataProviderItemOptions={dataProviderItems}
                onClose={() => {
                    modalPropsData?.close();
                    setSelectedId(undefined);
                    tableContainerData?.tableQuery?.refetch();
                }}
            />

            {openProcessScrapeDataModal && (
                <ProcessScrapeData
                    key="process-scrape-data"
                    open={openProcessScrapeDataModal}
                    selectedDataProviderIds={selectedDataProviderIds}
                    onClose={() => {
                        setOpenProcessScrapeDataModal(false);
                    }}
                />
            )}

            {openImportItemModal && (
                <ImportData
                    key="import-data-provider"
                    open={openImportItemModal}
                    dataType={DataImportType.DATA_PROVIDER}
                    onClose={() => setOpenImportItemModal(false)}
                    onSuccess={() => tableContainerData?.tableQuery?.refetch()}
                    columns={importDataColumns as unknown as ColumnType<Record<string, any>>[]}
                />
            )}
        </Space>
    );
};

export default DataProviderPage;
