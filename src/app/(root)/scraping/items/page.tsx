'use client';

import { PlusOutlined } from '@ant-design/icons';

import {
    FormModalContainer,
    type ICardAction,
    type IFilterField,
    type IFormField,
    ListContainer,
    ListTable,
    StatusTag,
} from '@/components';
import { ColumnsType, ColumnType, CustomButton, CustomTag } from '@/components';
import { RESOURCE } from '@/config';
import type { FormMode } from '@/hooks';
import { formatDate } from '@/libs';
import { FormRuleType } from '@/utilities';

import { ImportData, ProcessScrapeData } from './components';
import { DataImportType, ProductMappingStatus } from './enums';
import { useItemPage } from './hooks';
import type { IItem, IItemFormValues } from './types';

export default function ItemPage() {
    const {
        table,
        debouncedSearch,
        createModalForm,
        editModalForm,
        openImportItemModal,
        setOpenImportItemModal,
        selectedItemIds,
        openProcessScrapeDataModal,
        setOpenProcessScrapeDataModal,
    } = useItemPage();

    const columns: ColumnsType<IItem> = [
        {
            title: 'Tên đối tượng',
            dataIndex: 'name',
            key: 'name',
            width: '25%',
            sorter: true,
            ellipsis: true,
        },
        {
            title: 'Trạng thái ánh xạ',
            dataIndex: 'mappingStatus',
            key: 'mappingStatus',
            width: '15%',
            render: (mappingStatus: ProductMappingStatus) => <StatusTag status={mappingStatus} />,
        },
        {
            title: 'Mã',
            dataIndex: 'code',
            key: 'code',
            width: '15%',
            align: 'center',
            render: (code: string) => <StatusTag status={code} />,
        },
        {
            title: 'Tags',
            dataIndex: 'tags',
            key: 'tags',
            width: '20%',
            align: 'center',
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
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: '25%',
            sorter: true,
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
            placeholder: 'Tìm kiếm theo tên đối tượng...',
            onChange: (value) => debouncedSearch(value?.toString() ?? ''),
        },
    ];

    const formFields: IFormField<IItemFormValues>[] = [
        {
            name: 'name',
            label: 'Tên đối tượng',
            type: 'input',
            placeholder: 'Nhập tên đối tượng',
            rulesConfig: [
                {
                    type: FormRuleType.Required,
                    message: 'Vui lòng nhập tên đối tượng',
                },
                {
                    type: FormRuleType.Max,
                    max: 255,
                    message: 'Tên đối tượng không được vượt quá 255 ký tự',
                },
            ],
        },
        {
            name: 'code',
            label: 'Mã',
            type: 'input',
            placeholder: 'Nhập mã đối tượng',
            disabled: (mode: FormMode) => mode === 'edit',
            rulesConfig: [
                {
                    type: FormRuleType.Required,
                    message: 'Vui lòng nhập mã đối tượng',
                },
                {
                    type: FormRuleType.Max,
                    max: 20,
                    message: 'Mã đối tượng không được vượt quá 20 ký tự',
                },
            ],
        },
        {
            name: 'tags',
            label: 'Tags',
            type: 'input',
            placeholder: 'Nhập các tag, cách nhau bằng dấu phẩy ","',
            rulesConfig: [
                {
                    type: FormRuleType.Custom,
                    validator: (_: unknown, value: unknown) => {
                        if (
                            value &&
                            typeof value === 'string' &&
                            value.split(',').some((tag) => tag.trim().length === 0 && tag !== '')
                        ) {
                            return Promise.reject(new Error('Tag không được bỏ trống!'));
                        }
                        return Promise.resolve();
                    },
                },
            ],
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
        <>
            <ListContainer filters={filters} actions={actions}>
                <ListTable<IItem>
                    columns={columns}
                    table={table}
                    deleteResource={RESOURCE.ITEMS}
                    onEdit={(record) => editModalForm.show(record.id)}
                />
            </ListContainer>

            <FormModalContainer
                modalForm={createModalForm}
                title="Thêm mới đối tượng"
                sections={[{ type: 'plain', fields: formFields }]}
                createInitialValues={{ name: '', code: '', tags: '' }}
            />
            <FormModalContainer
                modalForm={editModalForm}
                title="Chỉnh sửa đối tượng"
                sections={[{ type: 'plain', fields: formFields }]}
            />

            {openImportItemModal && (
                <ImportData
                    key="import-item"
                    open={openImportItemModal}
                    dataType={DataImportType.ITEM}
                    onSuccess={() => table.tableQuery.refetch()}
                    onClose={() => setOpenImportItemModal(false)}
                    columns={importDataColumns as unknown as ColumnType<Record<string, unknown>>[]}
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
}
