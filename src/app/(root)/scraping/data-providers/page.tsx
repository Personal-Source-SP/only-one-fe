'use client';

import {
    FormModalContainer,
    ListContainer,
    ListTable,
    type ICardAction,
    type IFilterField,
    type IFormField,
} from '@/components';
import { CustomButton, type ColumnsType } from '@/components';
import { RESOURCE } from '@/config';
import type { FormMode } from '@/hooks';
import { formatDate, slugify } from '@/libs';
import { FormRuleType } from '@/utilities';
import { PlusOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useDataProviderPage } from './hooks';
import type { IDataProvider, IDataProviderFormValues } from './types/data-provider.type';

export default function DataProviderPage() {
    const router = useRouter();
    const { table, debouncedSearch, createModalForm, editModalForm } = useDataProviderPage();

    const columns: ColumnsType<IDataProvider> = [
        {
            title: 'Tên',
            dataIndex: 'name',
            key: 'name',
            width: '25%',
            sorter: true,
            ellipsis: true,
            render: (name: string, record) => (
                <CustomButton
                    type="link"
                    className="p-0 font-medium text-hub-primary hover:underline"
                    onClick={() => router.push(`/scraping/features/${record.id}`)}
                >
                    {name}
                </CustomButton>
            ),
        },
        {
            title: 'Mã',
            dataIndex: 'identifier',
            key: 'identifier',
            width: '15%',
            sorter: true,
            ellipsis: true,
        },
        {
            title: 'URL cơ sở',
            dataIndex: 'baseUrl',
            key: 'baseUrl',
            width: '30%',
            sorter: true,
            ellipsis: true,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: '15%',
            sorter: true,
            render: (createdAt: Date) => formatDate(createdAt),
        },
    ];

    const actions: ICardAction[] = [
        {
            label: 'Thêm nhà cung cấp',
            icon: <PlusOutlined />,
            permissionAction: 'create',
            component: (
                <CustomButton
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => createModalForm.show()}
                >
                    Thêm nhà cung cấp
                </CustomButton>
            ),
        },
    ];

    const filters: IFilterField[] = [
        {
            name: 'search',
            type: 'input',
            isPrimary: true,
            placeholder: 'Tìm kiếm theo tên nhà cung cấp...',
            onChange: (value) => debouncedSearch(value?.toString() ?? ''),
        },
    ];

    const formFields: IFormField<IDataProviderFormValues>[] = [
        {
            name: 'name',
            label: 'Tên nhà cung cấp',
            type: 'input',
            placeholder: 'Nhập tên nhà cung cấp',
            rulesConfig: [
                {
                    type: FormRuleType.Required,
                    message: 'Vui lòng nhập tên nhà cung cấp',
                },
                {
                    type: FormRuleType.Max,
                    max: 255,
                    message: 'Tên nhà cung cấp không được vượt quá 255 ký tự',
                },
            ],
        },
        {
            name: 'identifier',
            label: 'Mã nhà cung cấp',
            type: 'input',
            placeholder: 'Nhập mã nhà cung cấp',
            disabled: (mode: FormMode) => mode === 'edit',
            addonAfter: (form, mode: FormMode) =>
                mode === 'create' ? (
                    <CustomButton
                        type="text"
                        size="small"
                        onClick={() => {
                            if (!form) return;
                            const currentName = form.getFieldValue('name');
                            if (currentName) {
                                form.setFieldValue('identifier', slugify(currentName, 20));
                                form.validateFields(['identifier']);
                            }
                        }}
                        className="flex items-center gap-1 font-medium text-hub-primary"
                    >
                        <ThunderboltOutlined />
                        Tự động sinh
                    </CustomButton>
                ) : undefined,
            rulesConfig: [
                {
                    type: FormRuleType.Required,
                    message: 'Vui lòng nhập mã nhà cung cấp',
                },
                {
                    type: FormRuleType.Max,
                    max: 20,
                    message: 'Mã nhà cung cấp không được vượt quá 20 ký tự',
                },
                {
                    type: FormRuleType.Code,
                    message: 'Mã nhà cung cấp chỉ được chứa chữ cái thường, số và dấu gạch ngang',
                },
            ],
        },
        {
            name: 'baseUrl',
            label: 'URL cơ sở',
            type: 'input',
            placeholder: 'https://example.com',
            rulesConfig: [
                {
                    type: FormRuleType.Url,
                },
                {
                    type: FormRuleType.Required,
                    message: 'Vui lòng nhập URL cơ sở',
                },
            ],
        },
    ];

    return (
        <>
            <ListContainer filters={filters} actions={actions}>
                <ListTable<IDataProvider>
                    columns={columns}
                    table={table}
                    deleteResource={RESOURCE.DATA_PROVIDERS}
                    onEdit={(record) => editModalForm.show(record.id)}
                    onView={(record) => router.push(`/scraping/features/${record.id}`)}
                />
            </ListContainer>

            <FormModalContainer
                modalForm={createModalForm}
                title="Thêm mới nhà cung cấp"
                sections={[{ type: 'plain', fields: formFields }]}
                createInitialValues={{ name: '', baseUrl: '', identifier: '' }}
            />
            <FormModalContainer
                modalForm={editModalForm}
                title="Chỉnh sửa nhà cung cấp"
                sections={[{ type: 'plain', fields: formFields }]}
            />
        </>
    );
}
