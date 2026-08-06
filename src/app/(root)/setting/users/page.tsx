'use client';

import { Icon } from '@iconify/react';
import { DataTableContainer } from '@/components/common';
import { NUser } from '@/interfaces';

import { columns, filterSearch } from './constants';
import { useUsersPage } from './hooks';

const UsersPage = () => {
    const { tableContainerData, modalPropsData } = useUsersPage();

    const actionItems = [
        {
            key: 'edit',
            label: 'Chỉnh sửa',
            icon: <Icon icon="lucide:edit" />,
            onClick: (record: NUser.IUser) => modalPropsData?.show?.(record?.id),
        },
    ];

    return (
        <DataTableContainer
            resource="users"
            columns={columns}
            title="Danh sách người dùng"
            description="Quản lý người dùng hệ thống"
            actionItems={actionItems}
            tableContainerData={tableContainerData}
            filterSearch={filterSearch}
        />
    );
};

export default UsersPage;
