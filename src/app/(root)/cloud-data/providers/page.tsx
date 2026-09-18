'use client';

import {
    ListContainer,
    StatusTag,
    type ICardAction,
    type IFilterField,
    type IFormField,
} from '@/components/common';
import { ColumnsType, CustomButton } from '@/components/custom-antd';
import { API_ENDPOINT, RESOURCE } from '@/config';
import { useCustomModalForm, useCustomTable, type FormMode } from '@/hooks';
import { capitalizeFirstLetter, enumToOptions, formatDate, formatFileSize } from '@/libs';
import { PlusOutlined } from '@ant-design/icons';
import { CLOUD_DATA_PROVIDER_FIELDS } from './constants';
import { CloudDataProviderType } from './enums';
import type { CloudProviderFormValues, CloudProviderRecord } from './types';

export default function CloudDataProviderPage() {
    const { tableProps, tableQuery, debouncedSearch } = useCustomTable<CloudProviderRecord>({
        resource: API_ENDPOINT.CLOUD_DATA_PROVIDERS.BASE,
    });

    const createModalForm = useCustomModalForm<
        CloudProviderRecord,
        CloudProviderFormValues,
        CloudProviderRecord
    >({
        action: 'create',
        resource: API_ENDPOINT.CLOUD_DATA_PROVIDERS.BASE,
        onMutationSuccess: async () => {
            await tableQuery.refetch();
        },
    });

    const editModalForm = useCustomModalForm<
        CloudProviderRecord,
        CloudProviderFormValues,
        CloudProviderRecord
    >({
        action: 'edit',
        resource: API_ENDPOINT.CLOUD_DATA_PROVIDERS.BASE,
        onMutationSuccess: async () => {
            await tableQuery.refetch();
        },
        initialValuesMapper: (record) => ({
            name: record.name,
            type: record.type,
            config: record.config ? JSON.stringify(record.config, null, 2) : undefined,
            isActive: record.isActive,
        }),
    });

    const columns: ColumnsType<CloudProviderRecord> = [
        {
            title: 'STT',
            key: 'index',
            dataIndex: 'index',
            width: 60,
            align: 'center',
            render: (_: unknown, __: unknown, index: number) => index + 1,
        },
        {
            dataIndex: CLOUD_DATA_PROVIDER_FIELDS.NAME.key,
            key: CLOUD_DATA_PROVIDER_FIELDS.NAME.key,
            ...CLOUD_DATA_PROVIDER_FIELDS.NAME.table,
        },
        {
            dataIndex: CLOUD_DATA_PROVIDER_FIELDS.TYPE.key,
            key: CLOUD_DATA_PROVIDER_FIELDS.TYPE.key,
            ...CLOUD_DATA_PROVIDER_FIELDS.TYPE.table,
            render: (type: CloudDataProviderType) => (
                <StatusTag status={capitalizeFirstLetter(type)} />
            ),
        },
        {
            dataIndex: CLOUD_DATA_PROVIDER_FIELDS.IS_ACTIVE.key,
            key: CLOUD_DATA_PROVIDER_FIELDS.IS_ACTIVE.key,
            ...CLOUD_DATA_PROVIDER_FIELDS.IS_ACTIVE.table,
            render: (isActive: boolean) => <StatusTag status={isActive ? 'active' : 'inactive'} />,
        },
        {
            dataIndex: CLOUD_DATA_PROVIDER_FIELDS.TOTAL_ITEMS.key,
            key: CLOUD_DATA_PROVIDER_FIELDS.TOTAL_ITEMS.key,
            ...CLOUD_DATA_PROVIDER_FIELDS.TOTAL_ITEMS.table,
            render: (totalItems: number) => totalItems?.toLocaleString() ?? 0,
        },
        {
            dataIndex: CLOUD_DATA_PROVIDER_FIELDS.TOTAL_SIZE.key,
            key: CLOUD_DATA_PROVIDER_FIELDS.TOTAL_SIZE.key,
            ...CLOUD_DATA_PROVIDER_FIELDS.TOTAL_SIZE.table,
            render: (totalSize: number) => formatFileSize(totalSize),
        },
        {
            dataIndex: CLOUD_DATA_PROVIDER_FIELDS.CREATED_AT.key,
            key: CLOUD_DATA_PROVIDER_FIELDS.CREATED_AT.key,
            ...CLOUD_DATA_PROVIDER_FIELDS.CREATED_AT.table,
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
            placeholder: 'Tìm kiếm nhà cung cấp...',
            onChange: (value) => debouncedSearch(value?.toString() ?? ''),
        },
    ];

    const formFields: IFormField<CloudProviderFormValues>[] = [
        {
            name: CLOUD_DATA_PROVIDER_FIELDS.NAME.key,
            label: CLOUD_DATA_PROVIDER_FIELDS.NAME.label,
            ...CLOUD_DATA_PROVIDER_FIELDS.NAME.form,
        },
        {
            name: CLOUD_DATA_PROVIDER_FIELDS.TYPE.key,
            label: CLOUD_DATA_PROVIDER_FIELDS.TYPE.label,
            type: 'select',
            options: enumToOptions(CloudDataProviderType) ?? [],
            disabled: (mode: FormMode) => mode === 'edit',
            rulesConfig: CLOUD_DATA_PROVIDER_FIELDS.TYPE.form?.rulesConfig,
        },
        {
            name: CLOUD_DATA_PROVIDER_FIELDS.CONFIG.key,
            label: CLOUD_DATA_PROVIDER_FIELDS.CONFIG.label,
            ...CLOUD_DATA_PROVIDER_FIELDS.CONFIG.form,
        },
        {
            name: CLOUD_DATA_PROVIDER_FIELDS.IS_ACTIVE.key,
            label: CLOUD_DATA_PROVIDER_FIELDS.IS_ACTIVE.label,
            ...CLOUD_DATA_PROVIDER_FIELDS.IS_ACTIVE.form,
        },
    ];

    return (
        <ListContainer<CloudProviderRecord, CloudProviderFormValues>
            filters={filters}
            actions={actions}
            table={{
                columns,
                tableProps,
                tableQuery,
                deleteResource: RESOURCE.CLOUD_DATA_PROVIDERS,
                onEdit: (record) => editModalForm.show(record.id),
            }}
            formModal={[
                {
                    modalForm: createModalForm,
                    title: 'Thêm mới nhà cung cấp cloud',
                    sections: [{ type: 'plain', fields: formFields }],
                    createInitialValues: {
                        name: '',
                        type: CloudDataProviderType.TELEGRAM,
                        config: JSON.stringify({ channelId: '' }, null, 2),
                        isActive: true,
                    },
                },
                {
                    modalForm: editModalForm,
                    title: 'Chỉnh sửa nhà cung cấp cloud',
                    sections: [{ type: 'plain', fields: formFields }],
                },
            ]}
        />
    );
}
