'use client';

import {
    ListContainer,
    StatusTag,
    type ICardAction,
    type IFilterField,
    type IFormField,
} from '@/components/common';
import { ColumnType, ColumnsType, CustomButton, CustomTag } from '@/components/custom-antd';
import { API_ENDPOINT, RESOURCE } from '@/config';
import { useCustomModalForm, useCustomTable, type FormMode } from '@/hooks';
import { formatDate } from '@/libs';
import { PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { ImportData, ProcessScrapeData } from './components';
import { ITEM_FIELDS } from './constants';
import { DataImportType, ProductMappingStatus } from './enums';
import type { IItem, IItemFormValues } from './types';

export default function ItemPage() {
    const [openImportItemModal, setOpenImportItemModal] = useState(false);
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
    const [openProcessScrapeDataModal, setOpenProcessScrapeDataModal] = useState(false);

    const { tableProps, tableQuery, debouncedSearch } = useCustomTable<IItem>({
        resource: API_ENDPOINT.ITEMS.BASE,
    });

    const createModalForm = useCustomModalForm<IItem, IItemFormValues, IItem>({
        action: 'create',
        resource: API_ENDPOINT.ITEMS.BASE,
        onMutationSuccess: async () => {
            await tableQuery.refetch();
        },
    });

    const editModalForm = useCustomModalForm<IItem, IItemFormValues, IItem>({
        action: 'edit',
        resource: API_ENDPOINT.ITEMS.BASE,
        onMutationSuccess: async () => {
            await tableQuery.refetch();
        },
        initialValuesMapper: (record) => ({
            name: record.name,
            code: record.code ?? '',
            tags: Array.isArray(record.tags) ? record.tags.join(', ') : (record.tags ?? ''),
        }),
    });

    const columns: ColumnsType<IItem> = [
        {
            dataIndex: ITEM_FIELDS.NAME.key,
            key: ITEM_FIELDS.NAME.key,
            ...ITEM_FIELDS.NAME.table,
        },
        {
            dataIndex: ITEM_FIELDS.MAPPING_STATUS.key,
            key: ITEM_FIELDS.MAPPING_STATUS.key,
            ...ITEM_FIELDS.MAPPING_STATUS.table,
            render: (mappingStatus: ProductMappingStatus) => <StatusTag status={mappingStatus} />,
        },
        {
            dataIndex: ITEM_FIELDS.CODE.key,
            key: ITEM_FIELDS.CODE.key,
            ...ITEM_FIELDS.CODE.table,
            render: (code: string) => <StatusTag status={code} />,
        },
        {
            dataIndex: ITEM_FIELDS.TAGS.key,
            key: ITEM_FIELDS.TAGS.key,
            ...ITEM_FIELDS.TAGS.table,
            render: (tags: string[]) =>
                tags?.map((tag) => (
                    <span key={tag}>
                        <CustomTag color="blue" className="text-sm font-medium">
                            {tag}
                        </CustomTag>
                    </span>
                )),
        },
        {
            dataIndex: ITEM_FIELDS.CREATED_AT.key,
            key: ITEM_FIELDS.CREATED_AT.key,
            ...ITEM_FIELDS.CREATED_AT.table,
            render: (createdAt: Date) => formatDate(createdAt),
        },
    ];

    const actions: ICardAction[] = [
        {
            label: 'Thêm đối tượng',
            icon: <PlusOutlined />,
            permissionAction: 'create',
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
            isPrimary: true,
            placeholder: `Tìm kiếm theo ${ITEM_FIELDS.NAME.label.toLowerCase()}...`,
            onChange: (value) => debouncedSearch(value?.toString() ?? ''),
        },
    ];

    const formFields: IFormField<IItemFormValues>[] = [
        {
            name: ITEM_FIELDS.NAME.key,
            label: ITEM_FIELDS.NAME.label,
            ...ITEM_FIELDS.NAME.form,
        },
        {
            name: ITEM_FIELDS.CODE.key,
            label: ITEM_FIELDS.CODE.label,
            disabled: (mode: FormMode) => mode === 'edit',
            ...ITEM_FIELDS.CODE.form,
        },
        {
            name: ITEM_FIELDS.TAGS.key,
            label: ITEM_FIELDS.TAGS.label,
            ...ITEM_FIELDS.TAGS.form,
        },
    ];

    const importDataColumns: ColumnType<IItem>[] = [
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

    return (
        <ListContainer<IItem, IItemFormValues>
            filters={filters}
            actions={actions}
            table={{
                columns,
                tableProps,
                tableQuery,
                deleteResource: RESOURCE.ITEMS,
                onEdit: (record) => editModalForm.show(record.id),
            }}
            formModal={[
                {
                    modalForm: createModalForm,
                    title: 'Thêm mới đối tượng',
                    sections: [{ type: 'plain', fields: formFields }],
                    createInitialValues: { name: '', code: '', tags: '' },
                },
                {
                    modalForm: editModalForm,
                    title: 'Chỉnh sửa đối tượng',
                    sections: [{ type: 'plain', fields: formFields }],
                },
            ]}
            customModals={[
                openImportItemModal ? (
                    <ImportData
                        key="import-item"
                        open={openImportItemModal}
                        dataType={DataImportType.ITEM}
                        onSuccess={() => tableQuery.refetch()}
                        onClose={() => setOpenImportItemModal(false)}
                        columns={importDataColumns as unknown as ColumnType<Record<string, any>>[]}
                    />
                ) : null,
                openProcessScrapeDataModal ? (
                    <ProcessScrapeData
                        key="process-scrape-data"
                        open={openProcessScrapeDataModal}
                        selectedItemIds={selectedItemIds}
                        onClose={() => setOpenProcessScrapeDataModal(false)}
                    />
                ) : null,
            ]}
        />
    );
}
