import React from 'react';
import { ColumnsType } from '@/components/custom';
import { StatusTag } from '@/components/common';
import { CloudDataProviderType } from '@/enums';
import { FormFieldItem, NCloudData } from '@/interfaces';
import { capitalizeFirstLetter, enumToOptions, formatDate, formatFileSize } from '@/libs';

export const columns: ColumnsType<NCloudData.ICloudDataProvider> = [
    {
        title: 'STT',
        key: 'index',
        dataIndex: 'index',
        width: 60,
        align: 'center',
        render: (_: any, __: any, index: number) => index + 1,
    },
    {
        title: 'Tên kho',
        dataIndex: 'name',
        key: 'name',
        width: 200,
        ellipsis: true,
    },
    {
        title: 'Loại',
        dataIndex: 'type',
        key: 'type',
        width: 150,
        render: (type: CloudDataProviderType) => <StatusTag status={capitalizeFirstLetter(type)} />,
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
        title: 'Tổng số dữ liệu',
        dataIndex: 'totalItems',
        key: 'totalItems',
        width: 150,
        align: 'center',
        render: (totalItems: number) => totalItems?.toLocaleString() ?? 0,
    },
    {
        title: 'Tổng dung lượng',
        dataIndex: 'totalSize',
        key: 'totalSize',
        width: 150,
        align: 'center',
        render: (totalSize: number) => formatFileSize(totalSize),
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

export const formFields: FormFieldItem[] = [
    {
        type: 'input',
        name: 'name',
        label: 'Tên nhà cung cấp',
        rules: [{ required: true, message: 'Vui lòng nhập tên nhà cung cấp' }],
    },
    {
        type: 'select',
        name: 'type',
        label: 'Loại',
        disabled: true,
        rules: [{ required: true, message: 'Vui lòng chọn loại nhà cung cấp' }],
        selectProps: {
            options: enumToOptions(CloudDataProviderType) ?? [],
        },
    },
    {
        type: 'code-display',
        name: 'config',
        label: 'Cấu hình',
        codeProps: {
            language: 'json',
        },
        disabled: true,
    },
    {
        type: 'switch',
        name: 'isActive',
        label: 'Trạng thái',
        switchProps: {
            placeholder: 'Trạng thái của nhà cung cấp',
        },
    },
];

export const initialValues = {
    isActive: true,
    type: CloudDataProviderType.TELEGRAM,
    config: JSON.stringify({
        channelId: '',
    }),
};

export const filterSearch = {
    placeholder: 'Tìm kiếm nhà cung cấp',
};
