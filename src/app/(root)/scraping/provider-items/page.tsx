'use client';

import type { IDataProvider } from '@/app/(root)/scraping/data-providers/types';
import {
    ListContainer,
    type ICardAction,
    type IFilterField,
    type IFormField,
} from '@/components/common';
import { ColumnsType, CustomButton, CustomToggle } from '@/components/custom-antd';
import { API_ENDPOINT, RESOURCE } from '@/config';
import { MessageType } from '@/enums';
import {
    useCustomModalForm,
    useCustomMutationData,
    useCustomTable,
    useSelectCloudDataProvider,
    useSelectDataProvider,
    useSelectItem,
} from '@/hooks';
import { formatDate } from '@/libs';
import { PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { PROVIDER_ITEM_FIELDS } from './constants';
import type { ProviderItemFormValues, ProviderItemRecord } from './types';

export default function DataProviderItemPage() {
    const [switchingId, setSwitchingId] = useState<string | null>(null);

    const { options: itemOptions } = useSelectItem();
    const { options: cloudDataProviderOptions } = useSelectCloudDataProvider();
    const { options: dataProviderOptions, query: dataProviderQuery } = useSelectDataProvider();

    const { tableProps, tableQuery, debouncedSearch, setFilters } =
        useCustomTable<ProviderItemRecord>({
            resource: API_ENDPOINT.DATA_PROVIDER_ITEMS.BASE,
        });

    const { handleCustomMutationData: handleUpdate } = useCustomMutationData({
        method: 'put',
        successNotification: (data) => {
            if (!data?.data?.isSuccess) {
                return {
                    type: MessageType.ERROR,
                    message: 'Chuyển trạng thái thất bại',
                    description: data?.data?.message ?? 'Chuyển trạng thái thất bại',
                };
            }

            tableQuery?.refetch();

            return {
                type: MessageType.SUCCESS,
                message: 'Chuyển trạng thái thành công',
            };
        },
        errorNotification: (error) => ({
            type: MessageType.ERROR,
            message: 'Chuyển trạng thái thất bại',
            description: error?.message ?? 'Chuyển trạng thái thất bại',
        }),
    });

    const handleSwitchStatus = async (id: string, active: boolean) => {
        if (switchingId) return;
        setSwitchingId(id);
        try {
            await handleUpdate({
                url: API_ENDPOINT.DATA_PROVIDER_ITEMS.SWITCH_STATUS(id, active),
            });
        } finally {
            setSwitchingId(null);
        }
    };

    const createModalForm = useCustomModalForm<
        ProviderItemRecord,
        ProviderItemFormValues,
        ProviderItemRecord
    >({
        action: 'create',
        resource: API_ENDPOINT.DATA_PROVIDER_ITEMS.BASE,
        onMutationSuccess: async () => {
            await tableQuery.refetch();
        },
    });

    const editModalForm = useCustomModalForm<
        ProviderItemRecord,
        ProviderItemFormValues,
        ProviderItemRecord
    >({
        action: 'edit',
        resource: API_ENDPOINT.DATA_PROVIDER_ITEMS.BASE,
        onMutationSuccess: async () => {
            await tableQuery.refetch();
        },
        initialValuesMapper: (record) => ({
            itemId: record.itemId,
            itemUrl: record.itemUrl,
            dataProviderId: record.dataProviderId,
            cloudDataProviderId: record.cloudDataProviderId,
            autoProcessScraping: record.autoProcessScraping,
            checkDuplicateData: record.checkDuplicateData,
            isSavedToCloudData: record.isSavedToCloudData,
        }),
    });

    const columns: ColumnsType<ProviderItemRecord> = [
        {
            title: 'Thông tin đối tượng',
            dataIndex: 'itemAndProviderAndUrl',
            key: 'itemAndProviderAndUrl',
            ellipsis: true,
            width: 200,
            render: (_: unknown, record: ProviderItemRecord) => (
                <div className="flex flex-col gap-1">
                    <span className="font-semibold text-sm">{record?.item?.name ?? '---'}</span>
                    <span className="text-xs text-hub-subtitle">
                        {record?.dataProvider?.name ?? '---'}
                    </span>
                    <a
                        href={record.itemUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-hub-primary hover:underline truncate"
                    >
                        {record.itemUrl}
                    </a>
                </div>
            ),
        },
        {
            dataIndex: PROVIDER_ITEM_FIELDS.LAST_SCRAPED_TIMESTAMP.key,
            key: PROVIDER_ITEM_FIELDS.LAST_SCRAPED_TIMESTAMP.key,
            ...PROVIDER_ITEM_FIELDS.LAST_SCRAPED_TIMESTAMP.table,
            render: (lastScrapedTimestamp: Date) => formatDate(lastScrapedTimestamp),
        },
        {
            dataIndex: PROVIDER_ITEM_FIELDS.CREATED_AT.key,
            key: PROVIDER_ITEM_FIELDS.CREATED_AT.key,
            ...PROVIDER_ITEM_FIELDS.CREATED_AT.table,
            render: (createdAt: Date) => formatDate(createdAt),
        },
        {
            dataIndex: PROVIDER_ITEM_FIELDS.IS_ACTIVE.key,
            key: PROVIDER_ITEM_FIELDS.IS_ACTIVE.key,
            ...PROVIDER_ITEM_FIELDS.IS_ACTIVE.table,
            render: (isActive: boolean, record: ProviderItemRecord) => (
                <CustomToggle
                    loading={switchingId === record.id}
                    size="small"
                    checked={isActive}
                    onChange={(checked) => handleSwitchStatus(record.id, checked)}
                />
            ),
        },
        {
            dataIndex: PROVIDER_ITEM_FIELDS.IS_SAVED_TO_CLOUD_DATA.key,
            key: PROVIDER_ITEM_FIELDS.IS_SAVED_TO_CLOUD_DATA.key,
            ...PROVIDER_ITEM_FIELDS.IS_SAVED_TO_CLOUD_DATA.table,
            render: (isSavedToCloudData: boolean) => (
                <CustomToggle size="small" checked={isSavedToCloudData} disabled />
            ),
        },
    ];

    const actions: ICardAction[] = [
        {
            label: 'Thêm đối tượng nhà cung cấp',
            icon: <PlusOutlined />,
            permissionAction: 'create',
            component: (
                <CustomButton
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => createModalForm.show()}
                >
                    Thêm đối tượng nhà cung cấp
                </CustomButton>
            ),
        },
    ];

    const filters: IFilterField[] = [
        {
            name: 'search',
            type: 'input',
            isPrimary: true,
            placeholder: 'Tìm kiếm đối tượng nhà cung cấp...',
            onChange: (value) => debouncedSearch(value?.toString() ?? ''),
        },
        {
            name: 'dataProviderId',
            type: 'select',
            options: dataProviderOptions ?? [],
            placeholder: 'Chọn nhà cung cấp',
            onChange: (val) =>
                setFilters([
                    {
                        field: 'dataProviderId',
                        operator: 'eq',
                        value: val,
                    },
                ]),
        },
        {
            name: 'itemId',
            type: 'select',
            options: itemOptions ?? [],
            placeholder: 'Chọn đối tượng',
            onChange: (val) =>
                setFilters([
                    {
                        field: 'itemId',
                        operator: 'eq',
                        value: val,
                    },
                ]),
        },
    ];

    const formFields: IFormField<ProviderItemFormValues>[] = [
        {
            name: PROVIDER_ITEM_FIELDS.ITEM_ID.key,
            label: PROVIDER_ITEM_FIELDS.ITEM_ID.label,
            type: 'select',
            options: itemOptions,
            rulesConfig: PROVIDER_ITEM_FIELDS.ITEM_ID.form?.rulesConfig,
        },
        {
            name: PROVIDER_ITEM_FIELDS.DATA_PROVIDER_ID.key,
            label: PROVIDER_ITEM_FIELDS.DATA_PROVIDER_ID.label,
            type: 'select',
            options: dataProviderOptions,
            rulesConfig: PROVIDER_ITEM_FIELDS.DATA_PROVIDER_ID.form?.rulesConfig,
            selectProps: {
                onChange: (value: unknown) => {
                    const dataProvider = dataProviderQuery?.data?.data?.find(
                        (option: IDataProvider) => option.id === value,
                    );
                    if (dataProvider?.baseUrl) {
                        createModalForm.formProps.form?.setFieldValue(
                            'itemUrl',
                            dataProvider.baseUrl,
                        );
                        editModalForm.formProps.form?.setFieldValue(
                            'itemUrl',
                            dataProvider.baseUrl,
                        );
                    }
                },
            },
        },
        {
            name: PROVIDER_ITEM_FIELDS.ITEM_URL.key,
            label: PROVIDER_ITEM_FIELDS.ITEM_URL.label,
            ...PROVIDER_ITEM_FIELDS.ITEM_URL.form,
        },
        {
            name: PROVIDER_ITEM_FIELDS.CLOUD_DATA_PROVIDER_ID.key,
            label: PROVIDER_ITEM_FIELDS.CLOUD_DATA_PROVIDER_ID.label,
            type: 'select',
            options: cloudDataProviderOptions,
        },
        {
            name: 'autoProcessScraping',
            label: 'Tự động cào dữ liệu',
            type: 'switch',
            description: 'Tự động lên lịch cào dữ liệu định kỳ từ nhà cung cấp',
        },
        {
            name: 'checkDuplicateData',
            label: 'Kiểm tra dữ liệu trùng lặp',
            type: 'switch',
            description: 'Kiểm tra và loại bỏ dữ liệu trùng lặp trước khi lưu',
        },
        {
            name: 'isSavedToCloudData',
            label: 'Lưu vào kho dữ liệu',
            type: 'switch',
            description: 'Tự động đồng bộ dữ liệu đã cào vào kho dữ liệu cloud',
        },
    ];

    return (
        <ListContainer<ProviderItemRecord, ProviderItemFormValues>
            filters={filters}
            actions={actions}
            table={{
                columns,
                tableProps,
                tableQuery,
                deleteResource: RESOURCE.DATA_PROVIDER_ITEMS,
                onEdit: (record) => editModalForm.show(record.id),
            }}
            formModal={[
                {
                    modalForm: createModalForm,
                    title: 'Thêm mới đối tượng nhà cung cấp',
                    sections: [{ type: 'plain', fields: formFields }],
                    createInitialValues: {
                        itemId: '',
                        itemUrl: '',
                        dataProviderId: '',
                        cloudDataProviderId: undefined,
                        autoProcessScraping: true,
                        checkDuplicateData: true,
                        isSavedToCloudData: false,
                    },
                },
                {
                    modalForm: editModalForm,
                    title: 'Chỉnh sửa đối tượng nhà cung cấp',
                    sections: [{ type: 'plain', fields: formFields }],
                },
            ]}
        />
    );
}
