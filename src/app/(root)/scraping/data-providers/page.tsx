'use client';

import {
    ListWrapper,
    type CardAction,
    type IFilterField,
    type IFormField,
} from '@/components/common';
import { CustomButton, type ColumnsType } from '@/components/custom-antd';
import { API_ENDPOINT, RESOURCE } from '@/config';
import type { FormMode } from '@/hooks';
import { useCustomModalForm, useCustomTable } from '@/hooks';
import { formatDate, slugify } from '@/libs';
import { PlusOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { DATA_PROVIDER_FIELDS } from './constants';
import type { DataProviderFormValues, IDataProvider } from './types';

export default function DataProviderPage() {
    const router = useRouter();

    const { tableProps, tableQuery, debouncedSearch } = useCustomTable<IDataProvider>({
        resource: API_ENDPOINT.DATA_PROVIDERS.BASE,
    });

    const createModalForm = useCustomModalForm<
        IDataProvider,
        DataProviderFormValues,
        IDataProvider
    >({
        action: 'create',
        resource: API_ENDPOINT.DATA_PROVIDERS.BASE,
        onMutationSuccess: async () => {
            await tableQuery.refetch();
        },
    });

    const editModalForm = useCustomModalForm<IDataProvider, DataProviderFormValues, IDataProvider>({
        action: 'edit',
        resource: API_ENDPOINT.DATA_PROVIDERS.BASE,
        onMutationSuccess: async () => {
            await tableQuery.refetch();
        },
        initialValuesMapper: (record) => ({
            name: record.name,
            baseUrl: record.baseUrl,
            identifier: record.identifier,
        }),
    });

    const columns: ColumnsType<IDataProvider> = [
        {
            dataIndex: DATA_PROVIDER_FIELDS.NAME.key,
            key: DATA_PROVIDER_FIELDS.NAME.key,
            ...DATA_PROVIDER_FIELDS.NAME.table,
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
            dataIndex: DATA_PROVIDER_FIELDS.IDENTIFIER.key,
            key: DATA_PROVIDER_FIELDS.IDENTIFIER.key,
            ...DATA_PROVIDER_FIELDS.IDENTIFIER.table,
        },
        {
            dataIndex: DATA_PROVIDER_FIELDS.BASE_URL.key,
            key: DATA_PROVIDER_FIELDS.BASE_URL.key,
            ...DATA_PROVIDER_FIELDS.BASE_URL.table,
        },
        {
            dataIndex: DATA_PROVIDER_FIELDS.CREATED_AT.key,
            key: DATA_PROVIDER_FIELDS.CREATED_AT.key,
            ...DATA_PROVIDER_FIELDS.CREATED_AT.table,
            render: (createdAt: Date) => formatDate(createdAt),
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
            placeholder: `Tìm kiếm theo ${DATA_PROVIDER_FIELDS.NAME.label.toLowerCase()}`,
            onChange: (value) => debouncedSearch(value?.toString() ?? ''),
        },
    ];

    const formFields: IFormField<DataProviderFormValues>[] = [
        {
            name: DATA_PROVIDER_FIELDS.NAME.key,
            label: DATA_PROVIDER_FIELDS.NAME.label,
            ...DATA_PROVIDER_FIELDS.NAME.form,
        },
        {
            name: DATA_PROVIDER_FIELDS.IDENTIFIER.key,
            label: DATA_PROVIDER_FIELDS.IDENTIFIER.label,
            disabled: (mode: FormMode) => mode === 'edit',
            addonAfter: (form, mode: FormMode) =>
                mode === 'create' ? (
                    <CustomButton
                        type="text"
                        size="small"
                        onClick={() => {
                            if (!form) return;
                            const currentName = form.getFieldValue(DATA_PROVIDER_FIELDS.NAME.key);
                            if (currentName) {
                                form.setFieldValue(
                                    DATA_PROVIDER_FIELDS.IDENTIFIER.key,
                                    slugify(currentName, 20),
                                );
                                form.validateFields([DATA_PROVIDER_FIELDS.IDENTIFIER.key]);
                            }
                        }}
                        className="flex items-center gap-1 font-medium text-hub-primary"
                    >
                        <ThunderboltOutlined />
                        Tự động sinh
                    </CustomButton>
                ) : undefined,
            ...DATA_PROVIDER_FIELDS.IDENTIFIER.form,
        },
        {
            name: DATA_PROVIDER_FIELDS.BASE_URL.key,
            label: DATA_PROVIDER_FIELDS.BASE_URL.label,
            ...DATA_PROVIDER_FIELDS.BASE_URL.form,
        },
    ];

    return (
        <ListWrapper<IDataProvider, DataProviderFormValues>
            filters={filters}
            actions={actions}
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
                    fields: formFields,
                    modalForm: createModalForm,
                    title: 'Thêm mới nhà cung cấp',
                    createInitialValues: { name: '', baseUrl: '', identifier: '' },
                },
                {
                    fields: formFields,
                    modalForm: editModalForm,
                    title: 'Chỉnh sửa nhà cung cấp',
                },
            ]}
        />
    );
}
