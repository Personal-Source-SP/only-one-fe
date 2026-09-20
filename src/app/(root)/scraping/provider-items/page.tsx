'use client';

import type { IDataProvider } from '@/app/(root)/scraping/data-providers/types';
import {
    FormModalContainer,
    ListContainer,
    ListTable,
    type ICardAction,
    type IFilterField,
    type IFormField,
} from '@/components';
import {
    ColumnsType,
    CustomButton,
    CustomFlex,
    CustomToggle,
    CustomTypography,
} from '@/components';
import { API_ENDPOINT, RESOURCE } from '@/config';
import { formatDate } from '@/libs';
import { FormRuleType } from '@/utilities';
import { PlusOutlined } from '@ant-design/icons';
import { useProviderItemPage } from './hooks';
import type { IDataProviderItemFormValues, ProviderItemRecord } from './types';

export default function DataProviderItemPage() {
    const {
        itemOptions,
        cloudDataProviderOptions,
        dataProviderOptions,
        dataProviderQuery,
        table,
        debouncedSearch,
        setFilters,
        handleUpdate,
        createModalForm,
        editModalForm,
    } = useProviderItemPage();

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
            title: 'Ngày cào gần nhất',
            dataIndex: 'lastScrapedTimestamp',
            key: 'lastScrapedTimestamp',
            width: 150,
            sorter: true,
            render: (lastScrapedTimestamp: Date) => formatDate(lastScrapedTimestamp),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            sorter: true,
            render: (createdAt: Date) => formatDate(createdAt),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 140,
            align: 'center',
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
            title: 'Lưu Cloud',
            dataIndex: 'isSavedToCloudData',
            key: 'isSavedToCloudData',
            width: 120,
            align: 'center',
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
            name: 'itemId',
            label: 'Tên đối tượng',
            type: 'select',
            placeholder: 'Chọn đối tượng',
            options: itemOptions,
            rulesConfig: [
                {
                    type: FormRuleType.Required,
                    message: 'Vui lòng chọn đối tượng',
                },
            ],
        },
        {
            name: 'dataProviderId',
            label: 'Nhà cung cấp',
            type: 'select',
            placeholder: 'Chọn nhà cung cấp',
            options: dataProviderOptions,
            rulesConfig: [
                {
                    type: FormRuleType.Required,
                    message: 'Vui lòng chọn nhà cung cấp',
                },
            ],
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
            name: 'itemUrl',
            label: 'URL đối tượng',
            type: 'input',
            placeholder: 'Nhập URL đối tượng',
            rulesConfig: [
                {
                    type: FormRuleType.Required,
                    message: 'Vui lòng nhập URL đối tượng',
                },
                {
                    type: FormRuleType.Url,
                    message: 'URL không hợp lệ',
                },
            ],
        },
        {
            name: 'cloudDataProviderId',
            label: 'Nhà cung cấp kho dữ liệu',
            type: 'select',
            placeholder: 'Chọn nhà cung cấp kho dữ liệu (nếu có)',
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
        <>
            <ListContainer filters={filters} actions={actions}>
                <ListTable<ProviderItemRecord>
                    columns={columns}
                    table={table}
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
