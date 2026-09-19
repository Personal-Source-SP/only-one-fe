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
import { RESOURCE } from '@/config';
import { MimeType } from '@/enums';
import { formatDate, formatFileSize } from '@/libs';
import { FormRuleType } from '@/utilities';
import { PlusOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useCloudItemPage } from './hooks';
import type { CloudItemFormValues, CloudItemRecord } from './types';

export default function CloudDataItemPage() {
    const { tableProps, tableQuery, debouncedSearch, createModalForm, cloudDataProviderOptions } =
        useCloudItemPage();

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
            title: 'Tên file',
            dataIndex: 'fileName',
            key: 'fileName',
            width: 200,
            ellipsis: true,
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
            title: 'Đường dẫn',
            dataIndex: 'pathUrl',
            key: 'pathUrl',
            width: 250,
            ellipsis: true,
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
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 150,
            align: 'center',
            render: (isActive: boolean) => <StatusTag status={isActive ? 'active' : 'inactive'} />,
        },
        {
            title: 'Loại file',
            dataIndex: 'mimeType',
            key: 'mimeType',
            width: 150,
            ellipsis: true,
            render: (mimeType: string) => <StatusTag status={mimeType} />,
        },
        {
            title: 'Dung lượng',
            dataIndex: 'fileSize',
            key: 'fileSize',
            width: 150,
            align: 'center',
            render: (fileSize: number) => (fileSize ? formatFileSize(fileSize) : '-'),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 200,
            sorter: true,
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
            name: 'cloudDataProviderId',
            label: 'Nhà cung cấp kho dữ liệu',
            type: 'select',
            placeholder: 'Chọn nhà cung cấp',
            options: cloudDataProviderOptions ?? [],
            rulesConfig: [
                {
                    type: FormRuleType.Required,
                    message: 'Vui lòng chọn nhà cung cấp',
                },
            ],
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
