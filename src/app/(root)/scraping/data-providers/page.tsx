'use client';

import {
    ListWrapper,
    type CardAction,
    type IFilterField,
    type IFormField,
} from '@/components/common';
import { CustomButton, type ColumnsType } from '@/components/custom-antd';
import { RESOURCE } from '@/config';
import type { FormMode } from '@/hooks';
import { formatDate, slugify } from '@/libs';
import { FormRuleType } from '@/utilities';
import { PlusOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

import { DATA_PROVIDER_COLUMNS_WIDTH, DATA_PROVIDER_LIMITS } from './constants';
import { useDataProviderPage } from './hooks';
import type { DataProviderFormValues, IDataProvider } from './types';

const DataProviderPage = () => {
    const router = useRouter();

    const { tableProps, tableQuery, createModalForm, editModalForm, debouncedSearch } =
        useDataProviderPage();

    const columns: ColumnsType<IDataProvider> = [
        {
            title: 'Tên',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
            sorter: true,
            width: DATA_PROVIDER_COLUMNS_WIDTH.NAME,
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
            ellipsis: true,
            sorter: true,
            width: DATA_PROVIDER_COLUMNS_WIDTH.IDENTIFIER,
        },
        {
            title: 'URL cơ sở',
            dataIndex: 'baseUrl',
            key: 'baseUrl',
            ellipsis: true,
            sorter: true,
            width: DATA_PROVIDER_COLUMNS_WIDTH.BASE_URL,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            sorter: true,
            render: (createdAt: Date) => formatDate(createdAt),
            width: DATA_PROVIDER_COLUMNS_WIDTH.CREATED_AT,
        },
    ];

    const actions: CardAction[] = [
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
            placeholder: 'Tìm kiếm theo tên nhà cung cấp',
            onChange: (value) => debouncedSearch(value?.toString() ?? ''),
        },
    ];

    const formFields: IFormField<DataProviderFormValues>[] = [
        {
            name: 'name',
            type: 'input',
            label: 'Tên nhà cung cấp',
            placeholder: 'Nhập tên nhà cung cấp',
            rulesConfig: [
                { type: FormRuleType.Required, message: 'Vui lòng nhập tên nhà cung cấp' },
                {
                    type: FormRuleType.Max,
                    max: DATA_PROVIDER_LIMITS.NAME_MAX_LENGTH,
                    message: `Tên nhà cung cấp không được vượt quá ${DATA_PROVIDER_LIMITS.NAME_MAX_LENGTH} ký tự`,
                },
            ],
        },
        {
            name: 'identifier',
            type: 'input',
            label: 'Mã nhà cung cấp',
            disabled: (mode: FormMode) => mode === 'edit',
            placeholder: 'Nhập mã nhà cung cấp',
            addonAfter: (form, mode: FormMode) =>
                mode === 'create' ? (
                    <CustomButton
                        type="text"
                        size="small"
                        onClick={() => {
                            if (!form) return;
                            const currentName = form.getFieldValue('name');
                            if (currentName) {
                                form.setFieldValue(
                                    'identifier',
                                    slugify(
                                        currentName,
                                        DATA_PROVIDER_LIMITS.IDENTIFIER_MAX_LENGTH,
                                    ),
                                );
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
                { type: FormRuleType.Required, message: 'Vui lòng nhập mã nhà cung cấp' },
                {
                    type: FormRuleType.Max,
                    max: DATA_PROVIDER_LIMITS.IDENTIFIER_MAX_LENGTH,
                    message: `Mã nhà cung cấp không được vượt quá ${DATA_PROVIDER_LIMITS.IDENTIFIER_MAX_LENGTH} ký tự`,
                },
                {
                    type: FormRuleType.Code,
                    message: 'Mã nhà cung cấp chỉ được chứa chữ cái thường, số và dấu gạch ngang',
                },
            ],
        },
        {
            name: 'baseUrl',
            type: 'input',
            label: 'URL cơ sở',
            placeholder: 'https://example.com',
            rulesConfig: [
                { type: FormRuleType.Url },
                { type: FormRuleType.Required, message: 'Vui lòng nhập URL cơ sở' },
            ],
        },
    ];

    return (
        <ListWrapper<IDataProvider, DataProviderFormValues>
            actions={actions}
            filters={filters}
            table={{
                columns,
                tableProps,
                tableQuery,
                deleteResource: RESOURCE.DATA_PROVIDERS,
                onEdit: (record) => editModalForm.show(record.id),
                onView: (record) => router.push(`/scraping/features/${record.id}`),
            }}
            formModal={[
                {
                    modalForm: createModalForm,
                    title: 'Thêm mới nhà cung cấp',
                    createInitialValues: { name: '', baseUrl: '', identifier: '' },
                    fields: formFields,
                },
                {
                    modalForm: editModalForm,
                    title: 'Chỉnh sửa nhà cung cấp',
                    fields: formFields,
                },
            ]}
        />
    );
};

export default DataProviderPage;
