import React from 'react';
import { ColumnType, ColumnsType, CustomTag } from '@/components/custom-antd';
import { StatusTag } from '@/components/common';
import { ProductMappingStatus } from '@/enums';
import { FormFieldItem, NDataProvider } from '@/interfaces';
import { formatDate } from '@/libs';

export const columns: ColumnsType<NDataProvider.IItem> = [
    {
        title: 'Tên thư mục',
        dataIndex: 'name',
        key: 'name',
        ellipsis: true,
        sorter: true,
        width: '25%',
    },
    {
        key: 'mappingStatus',
        title: 'Trạng thái ánh xạ',
        dataIndex: 'mappingStatus',
        render: (mappingStatus: ProductMappingStatus) => <StatusTag status={mappingStatus} />,
        width: '15%',
    },
    {
        key: 'code',
        title: 'Mã',
        align: 'center',
        dataIndex: 'code',
        render: (code: string) => <StatusTag status={code} />,
        width: '15%',
    },
    {
        key: 'tags',
        title: 'Tags',
        align: 'center',
        dataIndex: 'tags',
        render: (tags: string[]) =>
            tags?.map((tag) => (
                <span key={tag}>
                    <CustomTag color="blue" className="text-sm font-medium">
                        {tag}
                    </CustomTag>
                </span>
            )),
        width: '20%',
    },
    {
        title: 'Ngày tạo',
        dataIndex: 'createdAt',
        key: 'createdAt',
        sorter: true,
        render: (createdAt: Date) => formatDate(createdAt),
        width: '25%',
    },
];

export const importDataColumns: ColumnType<NDataProvider.IItem>[] = [
    {
        title: 'Tên đối tượng',
        dataIndex: 'name',
        key: 'name',
        ellipsis: true,
        width: '50%',
    },
    {
        title: 'Mã',
        dataIndex: 'code',
        key: 'code',
        width: '15%',
        align: 'center',
        ellipsis: true,
    },
    {
        title: 'Trạng thái ánh xạ',
        dataIndex: 'mappingStatus',
        key: 'mappingStatus',
        align: 'center',
        width: '35%',
        render: (mappingStatus: ProductMappingStatus) => <StatusTag status={mappingStatus} />,
    },
];

export const formFields: FormFieldItem[] = [
    {
        name: 'name',
        type: 'input',
        label: 'Tên đối tượng',
        rules: [
            { required: true, message: 'Vui lòng nhập tên đối tượng' },
            { max: 255, message: 'Tên đối tượng không được vượt quá 255 ký tự' },
        ],
    },
    {
        name: 'code',
        type: 'input',
        label: 'Mã',
        rules: [
            { required: true, message: 'Vui lòng nhập mã đối tượng' },
            { max: 20, message: 'Mã đối tượng không được vượt quá 20 ký tự' },
        ],
    },
    {
        name: 'tags',
        type: 'input',
        label: 'Tags',
        tooltip: 'Tags (cách nhau bằng dấu phẩy ",")',
        rules: [
            {
                validator: (_: any, value: string) => {
                    if (
                        value &&
                        typeof value === 'string' &&
                        value.split(',').some((tag) => tag.trim().length === 0 && tag !== '')
                    ) {
                        return Promise.reject(new Error('CustomTag không được bỏ trống!'));
                    }
                    return Promise.resolve();
                },
            },
        ],
        inputProps: {
            placeholder: 'Nhập các tag, mỗi tag cách nhau bằng dấu phẩy ","',
        },
    },
];

export const filterSearch = {
    placeholder: 'Tìm kiếm đối tượng',
};
