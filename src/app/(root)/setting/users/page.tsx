'use client';

import { DataTableContainer } from '@/components/common';
import { ColumnsType } from '@/components/custom';
import { useCustomModal, useTableContainer } from '@/hooks';
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

const UsersPage = () => {
    const tableContainerData = useTableContainer({
        resource: 'users',
    });

    const modalPropsData = useCustomModal({
        action: 'edit',
        resource: 'users',
    });

    const actionItems = [
        {
            key: 'edit',
            label: 'Chỉnh sửa',
            icon: <Icon icon="lucide:edit" />,
            onClick: (record: NUser.IUser) => modalPropsData?.show?.(record?.id),
        },
    ];

    const filterSearch = {
        name: 'userName',
        placeholder: 'Tìm kiếm người dùng',
    };

    return (
        <>
            <DataTableContainer
                resource="users"
                columns={columns}
                title="Danh sách người dùng"
                description="Quản lý người dùng hệ thống"
                actionItems={actionItems}
                tableContainerData={tableContainerData}
                filterSearch={filterSearch}
            />
        </>
    );
};

export default UsersPage;
