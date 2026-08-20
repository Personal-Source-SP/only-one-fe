'use client';

import Link from 'next/link';
import { PlusOutlined } from '@ant-design/icons';
import { ColumnsType, CustomButton, CustomFlex, CustomTooltip } from '@/components/custom-antd';
import {
    FilterPanel,
    ListTable,
    ListWrapper,
    StatusTag,
    type CardAction,
    type IFilterField,
} from '@/components/common';
import { MimeType } from '@/enums';
import { formatDate, formatFileSize } from '@/libs';

import { useCloudDataItemPage } from './hooks';
import { CloudItemFormModal } from './components';
import type { CloudItemRecord } from './types';

const CloudDataItem = () => {
    const { tableProps, tableQuery, debouncedSearch, createModalForm, cloudDataProviderOptions } =
        useCloudDataItemPage();

    const columns: ColumnsType<CloudItemRecord> = [
        {
            title: 'STT',
            key: 'index',
            dataIndex: 'index',
            width: 60,
            align: 'center',
            render: (_: any, __: any, index: number) => index + 1,
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

    const actions: CardAction[] = [
        {
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
            placeholder: 'Tìm kiếm dữ liệu đám mây...',
            onChange: (value) => debouncedSearch(value?.toString() ?? ''),
        },
    ];

    return (
        <>
            <ListWrapper
                actions={actions}
                error={tableQuery.error}
                isLoading={tableQuery.isLoading}
                filters={<FilterPanel fields={filters} />}
            >
                <ListTable<CloudItemRecord>
                    columns={columns}
                    tableProps={tableProps}
                    tableQuery={tableQuery}
                    deleteResource="cloud-data-items"
                />
            </ListWrapper>

            <CloudItemFormModal
                modalForm={createModalForm}
                cloudDataProviderOptions={cloudDataProviderOptions ?? []}
            />
        </>
    );
};

export default CloudDataItem;
