'use client';

import type { IGoogleAuth } from '@/app/(root)/google/drive/photos/types';
import {
    ListContainer,
    type ICardAction,
    type IFilterField,
    type IFormField,
} from '@/components/common';
import { ColumnsType, CustomButton } from '@/components/custom-antd';
import { API_ENDPOINT, RESOURCE } from '@/config';
import { useCustomModalForm, useCustomTable } from '@/hooks';
import { formatDate } from '@/libs';
import { PlusOutlined } from '@ant-design/icons';
import { Icon } from '@iconify/react';
import { USER_FIELDS } from './constants';
import type { IUserFormValues, UserFormValues, UserRecord } from './types';

export default function UsersPage() {
    const { tableProps, tableQuery, debouncedSearch } = useCustomTable<UserRecord>({
        resource: API_ENDPOINT.USERS.BASE,
    });

    const createModalForm = useCustomModalForm<UserRecord, UserFormValues, UserRecord>({
        action: 'create',
        resource: API_ENDPOINT.USERS.BASE,
        onMutationSuccess: async () => {
            await tableQuery.refetch();
        },
    });

    const editModalForm = useCustomModalForm<UserRecord, UserFormValues, UserRecord>({
        action: 'edit',
        resource: API_ENDPOINT.USERS.BASE,
        onMutationSuccess: async () => {
            await tableQuery.refetch();
        },
        initialValuesMapper: (record) => ({
            userName: record.userName,
            email: record.email,
            isActive: record.isActive,
        }),
    });

    const columns: ColumnsType<UserRecord> = [
        {
            dataIndex: USER_FIELDS.EMAIL.key,
            key: USER_FIELDS.EMAIL.key,
            ...USER_FIELDS.EMAIL.table,
        },
        {
            dataIndex: USER_FIELDS.USER_NAME.key,
            key: USER_FIELDS.USER_NAME.key,
            ...USER_FIELDS.USER_NAME.table,
        },
        {
            dataIndex: USER_FIELDS.IS_ACTIVE.key,
            key: USER_FIELDS.IS_ACTIVE.key,
            ...USER_FIELDS.IS_ACTIVE.table,
            render: (isActive: boolean) =>
                isActive ? (
                    <Icon icon="lucide:check" className="w-full text-green-500" />
                ) : (
                    <Icon icon="lucide:x" className="w-full text-red-500" />
                ),
        },
        {
            dataIndex: USER_FIELDS.GOOGLE_AUTH.key,
            key: USER_FIELDS.GOOGLE_AUTH.key,
            ...USER_FIELDS.GOOGLE_AUTH.table,
            render: (googleAuths: IGoogleAuth[]) =>
                googleAuths && googleAuths.length > 0 ? (
                    <Icon icon="lucide:check" className="w-full text-green-500" />
                ) : (
                    <Icon icon="lucide:x" className="w-full text-neutral-400" />
                ),
        },
        {
            dataIndex: USER_FIELDS.CREATED_AT.key,
            key: USER_FIELDS.CREATED_AT.key,
            ...USER_FIELDS.CREATED_AT.table,
            render: (createdAt: Date) => formatDate(createdAt),
        },
    ];

    const actions: ICardAction[] = [
        {
            label: 'Thêm người dùng',
            icon: <PlusOutlined />,
            permissionAction: 'create',
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
            isPrimary: true,
            placeholder: 'Tìm kiếm người dùng...',
            onChange: (value) => debouncedSearch(value?.toString() ?? ''),
        },
    ];

    const formFields: IFormField<IUserFormValues>[] = [
        {
            name: USER_FIELDS.USER_NAME.key,
            label: USER_FIELDS.USER_NAME.label,
            ...USER_FIELDS.USER_NAME.form,
        },
        {
            name: USER_FIELDS.EMAIL.key,
            label: USER_FIELDS.EMAIL.label,
            ...USER_FIELDS.EMAIL.form,
        },
        {
            name: USER_FIELDS.IS_ACTIVE.key,
            label: USER_FIELDS.IS_ACTIVE.label,
            ...USER_FIELDS.IS_ACTIVE.form,
        },
    ];

    return (
        <ListContainer<UserRecord, UserFormValues>
            filters={filters}
            actions={actions}
            table={{
                columns,
                tableProps,
                tableQuery,
                deleteResource: RESOURCE.USERS,
                onEdit: (record) => editModalForm.show(record.id),
            }}
            formModal={[
                {
                    modalForm: createModalForm,
                    title: 'Thêm mới người dùng',
                    sections: [{ type: 'plain', fields: formFields }],
                    createInitialValues: { userName: '', email: '', isActive: true },
                },
                {
                    modalForm: editModalForm,
                    title: 'Chỉnh sửa người dùng',
                    sections: [{ type: 'plain', fields: formFields }],
                },
            ]}
        />
    );
}
