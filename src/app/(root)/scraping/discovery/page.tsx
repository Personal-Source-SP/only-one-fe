'use client';

import {
    DataProviderFeatureStatus,
    DataProviderFeatureType,
} from '@/app/(root)/scraping/features/enums';
import type { ISearchTargetConfig } from '@/app/(root)/scraping/features/types';
import {
    ListContainer,
    type ICardAction,
    type IFilterField,
    type IFormField,
} from '@/components/common';
import { CustomButton, CustomTag, type ColumnsType } from '@/components/custom-antd';
import { API_ENDPOINT, RESOURCE } from '@/config';
import { useCustomModalForm, useCustomTable, useSelectDataProvider } from '@/hooks';
import { formatDate } from '@/libs';
import { PlusOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { DISCOVERY_SESSION_FIELDS, DISCOVERY_SESSION_STATUS_COLOR_MAP } from './constants';
import {
    DiscoverySessionStatus,
    type CreateSessionFormValues,
    type IDiscoverySession,
} from './types';

export default function DiscoveryPage() {
    const router = useRouter();

    const { options: dataProviderOptions, query: dataProviderQuery } = useSelectDataProvider({
        featureType: DataProviderFeatureType.SEARCH,
        featureStatus: DataProviderFeatureStatus.READY,
    });

    const { tableProps, tableQuery, debouncedSearch, setFilters } =
        useCustomTable<IDiscoverySession>({
            resource: API_ENDPOINT.DISCOVERY_SESSIONS.BASE,
        });

    const createModalForm = useCustomModalForm<
        IDiscoverySession,
        CreateSessionFormValues,
        IDiscoverySession
    >({
        action: 'create',
        resource: API_ENDPOINT.DISCOVERY_SESSIONS.BASE,
        successNotification: { type: 'success', message: 'Tạo phiên khám phá thành công' },
        onMutationSuccess: async () => {
            await tableQuery.refetch();
        },
        onFinish: (values) => {
            const rawKeywords = values.targetKeywords;
            const targetKeywords = Array.isArray(rawKeywords)
                ? rawKeywords.map((k) => k.trim()).filter(Boolean)
                : undefined;

            return {
                ...values,
                targetKeywords,
                depth: values.depth || 1,
            };
        },
    });

    const columns: ColumnsType<IDiscoverySession> = [
        {
            dataIndex: DISCOVERY_SESSION_FIELDS.SESSION_CODE.key,
            key: DISCOVERY_SESSION_FIELDS.SESSION_CODE.key,
            ...DISCOVERY_SESSION_FIELDS.SESSION_CODE.table,
            render: (code: string, record) => (
                <CustomButton
                    type="link"
                    className="p-0 font-semibold text-hub-primary hover:underline"
                    onClick={() => router.push(`/scraping/discovery/${record.id}`)}
                >
                    {code}
                </CustomButton>
            ),
        },
        {
            dataIndex: ['dataProvider', 'name'],
            key: DISCOVERY_SESSION_FIELDS.DATA_PROVIDER.key,
            ...DISCOVERY_SESSION_FIELDS.DATA_PROVIDER.table,
            render: (name: string) => name || '—',
        },
        {
            dataIndex: DISCOVERY_SESSION_FIELDS.TARGET_URL.key,
            key: DISCOVERY_SESSION_FIELDS.TARGET_URL.key,
            ...DISCOVERY_SESSION_FIELDS.TARGET_URL.table,
        },
        {
            dataIndex: DISCOVERY_SESSION_FIELDS.STATUS.key,
            key: DISCOVERY_SESSION_FIELDS.STATUS.key,
            ...DISCOVERY_SESSION_FIELDS.STATUS.table,
            render: (status: DiscoverySessionStatus) => (
                <CustomTag color={DISCOVERY_SESSION_STATUS_COLOR_MAP[status]}>
                    {status?.toUpperCase()}
                </CustomTag>
            ),
        },
        {
            dataIndex: DISCOVERY_SESSION_FIELDS.TOTAL_DISCOVERED.key,
            key: DISCOVERY_SESSION_FIELDS.TOTAL_DISCOVERED.key,
            ...DISCOVERY_SESSION_FIELDS.TOTAL_DISCOVERED.table,
        },
        {
            dataIndex: DISCOVERY_SESSION_FIELDS.CREATED_AT.key,
            key: DISCOVERY_SESSION_FIELDS.CREATED_AT.key,
            ...DISCOVERY_SESSION_FIELDS.CREATED_AT.table,
            render: (date: Date) => formatDate(date),
        },
    ];

    const actions: ICardAction[] = [
        {
            label: 'Tạo phiên khám phá',
            icon: <PlusOutlined />,
            permissionAction: 'create',
            component: (
                <CustomButton
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => createModalForm.show()}
                >
                    Tạo phiên khám phá
                </CustomButton>
            ),
        },
    ];

    const filters: IFilterField[] = [
        {
            name: 'search',
            type: 'input',
            isPrimary: true,
            placeholder: 'Tìm theo mã phiên, URL...',
            onChange: (value) => debouncedSearch(value?.toString() ?? ''),
        },
        {
            name: 'dataProviderId',
            type: 'select',
            placeholder: 'Chọn nhà cung cấp',
            options: dataProviderOptions,
            onChange: (val) =>
                setFilters([
                    {
                        field: 'dataProviderId',
                        operator: 'eq',
                        value: val,
                    },
                ]),
        },
    ];

    const formFields: IFormField<CreateSessionFormValues>[] = [
        {
            name: DISCOVERY_SESSION_FIELDS.DATA_PROVIDER.key,
            label: DISCOVERY_SESSION_FIELDS.DATA_PROVIDER.label,
            selectProps: {
                options: dataProviderOptions,
                onChange: (value: string | undefined) => {
                    if (!value) {
                        createModalForm.formProps.form?.setFieldValue('maxUrls', undefined);
                        return;
                    }
                    const dataProvider = dataProviderQuery?.data?.data?.find(
                        (item) => item.id === value,
                    );
                    const searchFeature = dataProvider?.features?.find(
                        (f) => f.type === DataProviderFeatureType.SEARCH,
                    );
                    const searchConfig = searchFeature?.config as ISearchTargetConfig | undefined;
                    createModalForm.formProps.form?.setFieldValue(
                        'maxUrls',
                        searchConfig?.maxResults ?? undefined,
                    );
                },
            },
            ...DISCOVERY_SESSION_FIELDS.DATA_PROVIDER.form,
        },
        {
            name: DISCOVERY_SESSION_FIELDS.TARGET_KEYWORDS.key,
            label: DISCOVERY_SESSION_FIELDS.TARGET_KEYWORDS.label,
            selectProps: {
                mode: 'tags' as const,
                tokenSeparators: [','],
            },
            ...DISCOVERY_SESSION_FIELDS.TARGET_KEYWORDS.form,
        },
        {
            name: DISCOVERY_SESSION_FIELDS.DEPTH.key,
            label: DISCOVERY_SESSION_FIELDS.DEPTH.label,
            numberProps: { min: 1, max: 5 },
            ...DISCOVERY_SESSION_FIELDS.DEPTH.form,
        },
        {
            name: DISCOVERY_SESSION_FIELDS.MAX_URLS.key,
            label: DISCOVERY_SESSION_FIELDS.MAX_URLS.label,
            numberProps: { min: 1 },
            ...DISCOVERY_SESSION_FIELDS.MAX_URLS.form,
        },
        {
            name: DISCOVERY_SESSION_FIELDS.AUTO_VALIDATE.key,
            label: DISCOVERY_SESSION_FIELDS.AUTO_VALIDATE.label,
            description: DISCOVERY_SESSION_FIELDS.AUTO_VALIDATE.description,
            ...DISCOVERY_SESSION_FIELDS.AUTO_VALIDATE.form,
        },
    ];

    return (
        <ListContainer<IDiscoverySession, CreateSessionFormValues>
            filters={filters}
            actions={actions}
            table={{
                columns,
                tableProps,
                tableQuery,
                deleteResource: RESOURCE.DISCOVERY_SESSIONS,
                onView: (record) => router.push(`/scraping/discovery/${record.id}`),
            }}
            formModal={[
                {
                    modalForm: createModalForm,
                    width: 720,
                    cancelText: 'Hủy',
                    okText: 'Bắt đầu khám phá',
                    title: 'Khởi tạo phiên khám phá mới (Discovery Session)',
                    sections: [{ type: 'plain', fields: formFields }],
                    createInitialValues: {
                        depth: 1,
                        dataProviderId: '',
                        targetKeywords: [],
                        maxUrls: undefined,
                        autoValidate: true,
                    },
                },
            ]}
        />
    );
}
