'use client';

import { PlusOutlined } from '@ant-design/icons';
import { ColumnType, ColumnsType, CustomButton, CustomTag } from '@/components/custom-antd';
import {
    FilterPanel,
    ListTable,
    ListWrapper,
    StatusTag,
    type CardAction,
    type IFilterField,
} from '@/components/common';
import { DataImportType, ProductMappingStatus } from '@/enums';
import { formatDate } from '@/libs';

import { useItemPage } from './hooks';
import { ImportData, ItemFormModal, ProcessScrapeData } from './components';
import type { ItemRecord } from './types';

const ItemPage = () => {
    const {
        tableProps,
        tableQuery,
        debouncedSearch,
        createModalForm,
        editModalForm,
        openImportItemModal,
        setOpenImportItemModal,
        selectedItemIds,
        openProcessScrapeDataModal,
        setOpenProcessScrapeDataModal,
    } = useItemPage();

    const columns: ColumnsType<ItemRecord> = [
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

    const importDataColumns: ColumnType<ItemRecord>[] = [
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

    const actions: CardAction[] = [
        {
            component: (
                <CustomButton
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => createModalForm.show()}
                >
                    Thêm đối tượng
                </CustomButton>
            ),
        },
    ];

    const filters: IFilterField[] = [
        {
            name: 'search',
            type: 'input',
            placeholder: 'Tìm kiếm đối tượng...',
            onChange: (value) => debouncedSearch(value?.toString() ?? ''),
        },
    ];

    return (
        <>
            <ListWrapper
                actions={actions}
                error={tableQuery.error}
                isLoading={tableQuery.isLoading}
                filters={<FilterPanel fields={filters} />}
            >
                <ListTable<ItemRecord>
                    columns={columns}
                    tableProps={tableProps}
                    tableQuery={tableQuery}
                    deleteResource="items"
                    onEdit={(record) => editModalForm.show(record.id)}
                />
            </ListWrapper>

            <ItemFormModal modalForm={createModalForm} />
            <ItemFormModal modalForm={editModalForm} />

            {openImportItemModal && (
                <ImportData
                    key="import-item"
                    open={openImportItemModal}
                    dataType={DataImportType.ITEM}
                    onSuccess={() => tableQuery.refetch()}
                    onClose={() => setOpenImportItemModal(false)}
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
