'use client';

import { useMemo } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { CustomButton } from '@/components/custom';
import {
    FilterPanel,
    ListTable,
    ListWrapper,
    type CardAction,
    type IFilterField,
} from '@/components/custom-container';

import { columns } from './constants';
import { useUsersPage } from './hooks';
import { UserFormModal } from './components';
import type { UserRecord } from './types';

const UsersPage = () => {
    const { tableProps, tableQuery, debouncedSearch, createModalForm, editModalForm } =
        useUsersPage();

    const actions = useMemo<CardAction[]>(
        () => [
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
        ],
        [createModalForm],
    );

    const filters = useMemo<IFilterField[]>(
        () => [
            {
                name: 'search',
                type: 'input',
                placeholder: 'Tìm kiếm người dùng...',
                onChange: (value) => debouncedSearch(value?.toString() ?? ''),
            },
        ],
        [debouncedSearch],
    );

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
