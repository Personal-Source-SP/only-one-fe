'use client';

import { DataProviderFeatureType } from '@/app/(root)/scraping/features/enums';
import type { ISearchTargetConfig } from '@/app/(root)/scraping/features/types';
import {
    FormModalContainer,
    ListContainer,
    ListTable,
    type ICardAction,
    type IFilterField,
    type IFormField,
} from '@/components/common';
import { CustomButton, CustomTag, type ColumnsType } from '@/components/custom-antd';
import { RESOURCE } from '@/config';
import { formatDate } from '@/libs';
import { FormRuleType } from '@/utilities';
import { PlusOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { DISCOVERY_SESSION_STATUS_COLOR_MAP } from './constants';
import { useDiscoveryPage } from './hooks';
import {
    DiscoverySessionStatus,
    type CreateSessionFormValues,
    type IDiscoverySession,
} from './types';

export default function DiscoveryPage() {
    const router = useRouter();

    const {
        dataProviderOptions,
        dataProviderQuery,
        tableProps,
        tableQuery,
        debouncedSearch,
        setFilters,
        createModalForm,
    } = useDiscoveryPage();

    const columns: ColumnsType<IDiscoverySession> = [
        {
            title: 'Mã phiên',
            dataIndex: 'sessionCode',
            key: 'sessionCode',
            width: '15%',
            sorter: true,
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
            title: 'Nhà cung cấp',
            dataIndex: ['dataProvider', 'name'],
            key: 'dataProviderId',
            width: '18%',
            ellipsis: true,
            render: (name: string) => name || '—',
        },
        {
            title: 'URL Khám phá',
            dataIndex: 'targetUrl',
            key: 'targetUrl',
            width: '25%',
            ellipsis: true,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: '12%',
            align: 'center',
            render: (status: DiscoverySessionStatus) => (
                <CustomTag color={DISCOVERY_SESSION_STATUS_COLOR_MAP[status]}>
                    {status?.toUpperCase()}
                </CustomTag>
            ),
        },
        {
            title: 'URLs tìm thấy',
            dataIndex: 'totalDiscovered',
            key: 'totalDiscovered',
            width: '12%',
            align: 'right',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: '15%',
            sorter: true,
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
            name: 'dataProviderId',
            label: 'Nhà cung cấp',
            type: 'select',
            placeholder: 'Chọn nhà cung cấp',
            rulesConfig: [
                {
                    type: FormRuleType.Required,
                    message: 'Vui lòng chọn nhà cung cấp',
                },
            ],
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
        },
        {
            name: 'targetKeywords',
            label: 'Từ khóa sản phẩm mục tiêu (Target Keywords)',
            type: 'select',
            placeholder:
                'Nhập các từ khóa cách nhau bởi dấu phẩy hoặc phím Enter (ví dụ: Sony WH-1000XM4, iPhone 15 Pro, ...)',
            selectProps: {
                mode: 'tags' as const,
                tokenSeparators: [','],
            },
        },
        {
            name: 'depth',
            label: 'Độ sâu thu thập (Crawl Depth)',
            type: 'number',
            placeholder: 'Nhập độ sâu thu thập',
            numberProps: { min: 1, max: 5 },
        },
        {
            name: 'maxUrls',
            label: 'Giới hạn URLs tối đa (Max URLs - Tùy chọn override)',
            type: 'number',
            placeholder: 'Mặc định lấy theo cấu hình Search',
            numberProps: { min: 1 },
        },
        {
            name: 'autoValidate',
            label: 'Tự động xác thực URL (Auto Validate)',
            description:
                'Tự động kích hoạt hàng đợi xác thực các URL khám phá được ngay khi hoàn tất',
            type: 'switch',
        },
    ];

    return (
        <>
            <ListContainer filters={filters} actions={actions}>
                <ListTable<IDiscoverySession>
                    columns={columns}
                    tableProps={tableProps}
                    tableQuery={tableQuery}
                    deleteResource={RESOURCE.DISCOVERY_SESSIONS}
                    onView={(record) => router.push(`/scraping/discovery/${record.id}`)}
                />
            </ListContainer>

            <FormModalContainer
                modalForm={createModalForm}
                width={720}
                cancelText="Hủy"
                okText="Bắt đầu khám phá"
                title="Khởi tạo phiên khám phá mới (Discovery Session)"
                sections={[{ type: 'plain', fields: formFields }]}
                createInitialValues={{
                    depth: 1,
                    dataProviderId: '',
                    targetKeywords: [],
                    maxUrls: undefined,
                    autoValidate: true,
                }}
            />
        </>
    );
}
