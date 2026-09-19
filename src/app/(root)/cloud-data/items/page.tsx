'use client';

import {
    FormModalContainer,
    ListContainer,
    ListTable,
    StatusTag,
    type ICardAction,
    type IFilterField,
    type IFormField,
} from '@/components/common';
import { ColumnsType, CustomButton, CustomFlex, CustomTooltip } from '@/components/custom-antd';
import { API_ENDPOINT, RESOURCE } from '@/config';
import { MimeType } from '@/enums';
import { useCustomModalForm, useCustomTable, useSelectCloudDataProvider } from '@/hooks';
import { formatDate, formatFileSize } from '@/libs';
import { PlusOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { CLOUD_DATA_ITEM_FIELDS } from './constants';
import type { CloudItemFormValues, CloudItemRecord } from './types';

export default function CloudDataItemPage() {
    const { options: cloudDataProviderOptions } = useSelectCloudDataProvider();

    const { tableProps, tableQuery, debouncedSearch } = useCustomTable<CloudItemRecord>({
        resource: API_ENDPOINT.CLOUD_DATA_ITEMS.BASE,
    });

    const createModalForm = useCustomModalForm<
        CloudItemRecord,
        CloudItemFormValues,
        CloudItemRecord
    >({
        action: 'create',
        resource: API_ENDPOINT.CLOUD_DATA_ITEMS.BASE,
        onMutationSuccess: async () => {
            await tableQuery.refetch();
        },
    });

    const columns: ColumnsType<CloudItemRecord> = [
        {
            title: 'STT',
            key: 'index',
            dataIndex: 'index',
            width: 60,
            align: 'center',
            render: (_: unknown, __: unknown, index: number) => index + 1,
        },
        {
            dataIndex: CLOUD_DATA_ITEM_FIELDS.FILE_NAME.key,
            key: CLOUD_DATA_ITEM_FIELDS.FILE_NAME.key,
            ...CLOUD_DATA_ITEM_FIELDS.FILE_NAME.table,
            render: (fileName: string) => (
                <CustomTooltip title={fileName}>
                    <span
                        style={{ verticalAlign: 'middle' }}
                        className="inline-block max-w-[180px] truncate align-middle"
                    >
                        {fileName}
                    </span>
                </CustomTooltip>
            ),
        },
        {
            dataIndex: CLOUD_DATA_ITEM_FIELDS.PATH_URL.key,
            key: CLOUD_DATA_ITEM_FIELDS.PATH_URL.key,
            ...CLOUD_DATA_ITEM_FIELDS.PATH_URL.table,
            render: (pathUrl: string, record: CloudItemRecord) => {
                if (record.mimeType?.startsWith(MimeType.IMAGE)) {
                    return (
                        <CustomFlex align="center" justify="center">
                            <Link href={pathUrl} target="_blank" rel="noopener noreferrer">
                                <img src={pathUrl} alt="Xem" className="!h-20" />
                            </Link>
                        </CustomFlex>
                    );
                }

                return (
                    <CustomTooltip title={pathUrl}>
                        <Link
                            href={pathUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="max-w-[220px] truncate inline-block align-middle"
                        >
                            {pathUrl}
                        </Link>
                    </CustomTooltip>
                );
            },
        },
        {
            dataIndex: CLOUD_DATA_ITEM_FIELDS.IS_ACTIVE.key,
            key: CLOUD_DATA_ITEM_FIELDS.IS_ACTIVE.key,
            ...CLOUD_DATA_ITEM_FIELDS.IS_ACTIVE.table,
            render: (isActive: boolean) => <StatusTag status={isActive ? 'active' : 'inactive'} />,
        },
        {
            dataIndex: CLOUD_DATA_ITEM_FIELDS.MIME_TYPE.key,
            key: CLOUD_DATA_ITEM_FIELDS.MIME_TYPE.key,
            ...CLOUD_DATA_ITEM_FIELDS.MIME_TYPE.table,
            render: (mimeType: string) => <StatusTag status={mimeType} />,
        },
        {
            dataIndex: CLOUD_DATA_ITEM_FIELDS.FILE_SIZE.key,
            key: CLOUD_DATA_ITEM_FIELDS.FILE_SIZE.key,
            ...CLOUD_DATA_ITEM_FIELDS.FILE_SIZE.table,
            render: (fileSize: number) => (fileSize ? formatFileSize(fileSize) : '-'),
        },
        {
            dataIndex: CLOUD_DATA_ITEM_FIELDS.CREATED_AT.key,
            key: CLOUD_DATA_ITEM_FIELDS.CREATED_AT.key,
            ...CLOUD_DATA_ITEM_FIELDS.CREATED_AT.table,
            render: (createdAt: Date) => formatDate(createdAt),
        },
    ];

    const actions: ICardAction[] = [
        {
            label: 'Thêm dữ liệu',
            icon: <PlusOutlined />,
            permissionAction: 'create',
            component: (
                <CustomButton
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => createModalForm.show()}
                >
                    Thêm dữ liệu
                </CustomButton>
            ),
        },
    ];

    const filters: IFilterField[] = [
        {
            name: 'search',
            type: 'input',
            isPrimary: true,
            placeholder: 'Tìm kiếm dữ liệu đám mây...',
            onChange: (value) => debouncedSearch(value?.toString() ?? ''),
        },
    ];

    const formFields: IFormField<CloudItemFormValues>[] = [
        {
            name: CLOUD_DATA_ITEM_FIELDS.CLOUD_DATA_PROVIDER_ID.key,
            label: CLOUD_DATA_ITEM_FIELDS.CLOUD_DATA_PROVIDER_ID.label,
            type: 'select',
            options: cloudDataProviderOptions ?? [],
            rulesConfig: CLOUD_DATA_ITEM_FIELDS.CLOUD_DATA_PROVIDER_ID.form?.rulesConfig,
        },
        {
            name: 'file',
            label: 'Tệp dữ liệu',
            type: 'upload',
            uploadProps: {
                maxCount: 1,
                accept: '*/*',
            },
        },
    ];

    return (
        <>
            <ListContainer filters={filters} actions={actions}>
                <ListTable<CloudItemRecord>
                    columns={columns}
                    tableProps={tableProps}
                    tableQuery={tableQuery}
                    deleteResource={RESOURCE.CLOUD_DATA_ITEMS}
                />
            </ListContainer>

            <FormModalContainer
                modalForm={createModalForm}
                title="Thêm mới dữ liệu đám mây"
                sections={[{ type: 'plain', fields: formFields }]}
                createInitialValues={{
                    cloudDataProviderId: '',
                    file: undefined,
                }}
            />
        </>
    );
}
