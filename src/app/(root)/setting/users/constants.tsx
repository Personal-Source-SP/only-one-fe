import React from 'react';
import { ColumnsType } from '@/components/custom';
import { NGoogle, NUser } from '@/interfaces';
import { formatDate } from '@/libs';
import { Icon } from '@iconify/react';

export const columns: ColumnsType<NUser.IUser> = [
    {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        ellipsis: true,
        sorter: true,
    },
    {
        title: 'Tên người dùng',
        dataIndex: 'userName',
        key: 'userName',
        ellipsis: true,
        sorter: true,
    },
    {
        key: 'isActive',
        title: 'Trạng thái',
        align: 'center',
        dataIndex: 'isActive',
        render: (isActive: boolean) =>
            isActive ? (
                <Icon icon="lucide:check" className="w-full" />
            ) : (
                <Icon icon="lucide:x" className="w-full" />
            ),
    },
    {
        key: 'googleAuth',
        title: 'Kết nối Google',
        dataIndex: 'googleAuths',
        align: 'center',
        render: (googleAuths: NGoogle.IGoogleAuth[]) =>
            googleAuths?.length > 0 ? (
                <Icon icon="lucide:check" className="w-full" />
            ) : (
                <Icon icon="lucide:x" className="w-full" />
            ),
    },
    {
        title: 'Ngày tạo',
        dataIndex: 'createdAt',
        key: 'createdAt',
        sorter: true,
        render: (createdAt: Date) => formatDate(createdAt),
    },
];

export const filterSearch = {
    name: 'userName',
    placeholder: 'Tìm kiếm người dùng',
};
