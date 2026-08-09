'use client';

import { PlusOutlined } from '@ant-design/icons';
import { Icon } from '@iconify/react';
import { ColumnsType, CustomButton } from '@/components/custom-antd';
import {
    FilterPanel,
    ListTable,
    ListWrapper,
    type CardAction,
    type IFilterField,
} from '@/components/common';
import type { NGoogle, NUser } from '@/interfaces';
import { formatDate } from '@/libs';

import { useUsersPage } from './hooks';
import { UserFormModal } from './components';
import type { UserRecord } from './types';

const UsersPage = () => {
    const { tableProps, tableQuery, debouncedSearch, createModalForm, editModalForm } =
        useUsersPage();

    const columns: ColumnsType<NUser.IUser> = [
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

    const actions: CardAction[] = [
        {
            component: (
                <CustomButton
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => createModalForm.show()}
                >
                    Thêm người dùng
                </CustomButton>
            ),
        },
    ];

    const filters: IFilterField[] = [
        {
            name: 'search',
            type: 'input',
            placeholder: 'Tìm kiếm người dùng...',
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
                <ListTable<UserRecord>
                    columns={columns}
                    tableProps={tableProps}
                    tableQuery={tableQuery}
                    deleteResource="users"
                    onEdit={(record) => editModalForm.show(record.id)}
                />
            </ListWrapper>

            <UserFormModal modalForm={createModalForm} />
            <UserFormModal modalForm={editModalForm} />
        </>
    );
};

export default UsersPage;
