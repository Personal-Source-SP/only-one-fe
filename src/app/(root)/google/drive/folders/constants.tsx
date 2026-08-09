import React from 'react';
import { ColumnsType } from '@/components/custom-antd';
import { NGoogle } from '@/interfaces';
import { formatDate } from '@/libs';
import { Icon } from '@iconify/react';

export const FieldsEnum = {
    Name: 'name',
    ParentFolderId: 'parentFolderId',
};

export const columns: ColumnsType<NGoogle.IGoogleDriveFolder> = [
    {
        title: 'Tên thư mục',
        dataIndex: 'name',
        key: 'name',
        ellipsis: true,
        sorter: true,
    },
    {
        title: 'Ngày tạo',
        dataIndex: 'createdAt',
        key: 'createdAt',
        sorter: true,
        render: (createdAt: Date) => formatDate(createdAt),
    },
    {
        key: 'lastModified',
        title: 'Ngày chỉnh sửa',
        dataIndex: 'lastModified',
        sorter: true,
        render: (lastModified: Date) => formatDate(lastModified),
    },
    {
        key: 'isTrashed',
        title: 'Đã xóa',
        align: 'center',
        dataIndex: 'isTrashed',
        render: (isTrashed: boolean) =>
            isTrashed ? (
                <Icon icon="lucide:check" className="w-full" />
            ) : (
                <Icon icon="lucide:x" className="w-full" />
            ),
    },
    {
        key: 'isStarred',
        title: 'Gắn sao',
        align: 'center',
        dataIndex: 'isStarred',
        render: (isStarred: boolean) =>
            isStarred ? (
                <Icon icon="lucide:check" className="w-full" />
            ) : (
                <Icon icon="lucide:x" className="w-full" />
            ),
    },
];

export const filterSearch = {
    placeholder: 'Tìm kiếm thư mục',
};
