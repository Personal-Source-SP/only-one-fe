import React from 'react';
import Link from 'next/link';
import { ColumnsType, CustomFlex, CustomTooltip } from '@/components/custom-antd';
import { StatusTag } from '@/components/common';
import { MimeType } from '@/enums';
import { FormFieldItem, NCloudData } from '@/interfaces';
import { formatDate, formatFileSize } from '@/libs';

export const columns: ColumnsType<NCloudData.ICloudDataItem> = [
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
        render: (pathUrl: string, record: NCloudData.ICloudDataItem) => {
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

export const getCreateFormFields = (cloudDataProviderOptions: any[]): FormFieldItem[] => [
    {
        type: 'select',
        name: 'cloudDataProviderId',
        label: 'Nhà cung cấp',
        rules: [{ required: true, message: 'Vui lòng chọn nhà cung cấp' }],
        selectProps: {
            options: cloudDataProviderOptions ?? [],
            placeholder: 'Chọn nhà cung cấp',
        },
    },
    {
        type: 'upload',
        name: 'file',
        label: 'File',
        rules: [{ required: true, message: 'Vui lòng chọn file' }],
        uploadProps: {
            maxCount: 1,
            accept: '*/*',
        },
    },
];

export const filterSearch = {
    placeholder: 'Tìm kiếm dữ liệu đám mây',
};
