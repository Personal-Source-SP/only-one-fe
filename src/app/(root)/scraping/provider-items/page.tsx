'use client';

import type { IDataProvider } from '@/app/(root)/scraping/data-providers/types';
import {
    FormModalContainer,
    ListContainer,
    ListTable,
    type ICardAction,
    type IFilterField,
    type IFormField,
} from '@/components/common';
import {
    ColumnsType,
    CustomButton,
    CustomFlex,
    CustomToggle,
    CustomTypography,
} from '@/components/custom-antd';
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
import { PROVIDER_ITEM_FIELDS } from './constants';
import type { IDataProviderItemFormValues, ProviderItemRecord } from './types';

export default function DataProviderItemPage() {
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

    const createModalForm = useCustomModalForm<
        ProviderItemRecord,
        IDataProviderItemFormValues,
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
        IDataProviderItemFormValues,
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
                <CustomFlex vertical gap={4}>
                    <CustomTypography.Text strong className="text-sm">
                        {record?.item?.name ?? '---'}
                    </CustomTypography.Text>
                    <CustomTypography.Text type="secondary" className="text-xs">
                        {record?.dataProvider?.name ?? '---'}
                    </CustomTypography.Text>
                    <CustomTypography.Link
                        target="_blank"
                        rel="noreferrer"
                        href={record.itemUrl}
                        className="text-xs truncate"
                    >
                        {record.itemUrl}
                    </CustomTypography.Link>
                </CustomFlex>
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
                    size="small"
                    checked={isActive}
                    onChange={(checked) =>
                        handleUpdate({
                            url: API_ENDPOINT.DATA_PROVIDER_ITEMS.SWITCH_STATUS(record.id, checked),
                        })
                    }
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

    const formFields: IFormField<IDataProviderItemFormValues>[] = [
        {
            name: PROVIDER_ITEM_FIELDS.ITEM_ID.key,
            label: PROVIDER_ITEM_FIELDS.ITEM_ID.label,
            ...PROVIDER_ITEM_FIELDS.ITEM_ID.form,
            options: itemOptions,
        },
        {
            name: PROVIDER_ITEM_FIELDS.DATA_PROVIDER_ID.key,
            label: PROVIDER_ITEM_FIELDS.DATA_PROVIDER_ID.label,
            ...PROVIDER_ITEM_FIELDS.DATA_PROVIDER_ID.form,
            options: dataProviderOptions,
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
            ...PROVIDER_ITEM_FIELDS.CLOUD_DATA_PROVIDER_ID.form,
            options: cloudDataProviderOptions,
        },
        {
            name: PROVIDER_ITEM_FIELDS.AUTO_PROCESS_SCRAPING.key,
            label: PROVIDER_ITEM_FIELDS.AUTO_PROCESS_SCRAPING.label,
            ...PROVIDER_ITEM_FIELDS.AUTO_PROCESS_SCRAPING.form,
        },
        {
            name: PROVIDER_ITEM_FIELDS.CHECK_DUPLICATE_DATA.key,
            label: PROVIDER_ITEM_FIELDS.CHECK_DUPLICATE_DATA.label,
            ...PROVIDER_ITEM_FIELDS.CHECK_DUPLICATE_DATA.form,
        },
        {
            name: PROVIDER_ITEM_FIELDS.IS_SAVED_TO_CLOUD_DATA.key,
            label: PROVIDER_ITEM_FIELDS.IS_SAVED_TO_CLOUD_DATA.label,
            ...PROVIDER_ITEM_FIELDS.IS_SAVED_TO_CLOUD_DATA.form,
        },
    ];

    return (
        <>
            <ListContainer filters={filters} actions={actions}>
                <ListTable<ProviderItemRecord>
                    columns={columns}
                    tableProps={tableProps}
                    tableQuery={tableQuery}
                    deleteResource={RESOURCE.DATA_PROVIDER_ITEMS}
                    onEdit={(record) => editModalForm.show(record.id)}
                />
            </ListContainer>

            <FormModalContainer
                modalForm={createModalForm}
                title="Thêm mới đối tượng nhà cung cấp"
                sections={[{ type: 'plain', fields: formFields }]}
                createInitialValues={{
                    itemId: '',
                    itemUrl: '',
                    dataProviderId: '',
                    cloudDataProviderId: undefined,
                    autoProcessScraping: true,
                    checkDuplicateData: true,
                    isSavedToCloudData: false,
                }}
            />
            <FormModalContainer
                modalForm={editModalForm}
                title="Chỉnh sửa đối tượng nhà cung cấp"
                sections={[{ type: 'plain', fields: formFields }]}
            />
        </>
    );
}
