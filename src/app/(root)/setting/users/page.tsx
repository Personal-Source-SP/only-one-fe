'use client';

import type { IGoogleAuth } from '@/app/(root)/google/drive/photos/types';
import {
    FormModalContainer,
    ListContainer,
    ListTable,
    type ICardAction,
    type IFilterField,
    type IFormField,
} from '@/components/common';
import { ColumnsType, CustomButton } from '@/components/custom-antd';
import { RESOURCE } from '@/config';
import { formatDate } from '@/libs';
import { FormRuleType } from '@/utilities';
import { PlusOutlined } from '@ant-design/icons';
import { Icon } from '@iconify/react';
import { useUsersPage } from './hooks';
import type { IUserFormValues, UserRecord } from './types';

export default function UsersPage() {
    const { tableProps, tableQuery, debouncedSearch, createModalForm, editModalForm } =
        useUsersPage();

    const columns: ColumnsType<UserRecord> = [
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: '25%',
            sorter: true,
            ellipsis: true,
        },
        {
            title: 'Tên người dùng',
            dataIndex: 'userName',
            key: 'userName',
            width: '25%',
            sorter: true,
            ellipsis: true,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            width: '15%',
            align: 'center',
            render: (isActive: boolean) =>
                isActive ? (
                    <Icon icon="lucide:check" className="w-full text-green-500" />
                ) : (
                    <Icon icon="lucide:x" className="w-full text-red-500" />
                ),
        },
        {
            title: 'Kết nối Google',
            dataIndex: 'googleAuths',
            key: 'googleAuths',
            width: '15%',
            align: 'center',
            render: (googleAuths: IGoogleAuth[]) =>
                googleAuths && googleAuths.length > 0 ? (
                    <Icon icon="lucide:check" className="w-full text-green-500" />
                ) : (
                    <Icon icon="lucide:x" className="w-full text-neutral-400" />
                ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: '20%',
            sorter: true,
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
            name: 'userName',
            label: 'Tên người dùng',
            type: 'input',
            placeholder: 'Nhập tên người dùng',
            rulesConfig: [
                {
                    type: FormRuleType.Required,
                    message: 'Vui lòng nhập tên người dùng',
                },
            ],
        },
        {
            name: 'email',
            label: 'Email',
            type: 'input',
            placeholder: 'Nhập email',
            rulesConfig: [
                {
                    type: FormRuleType.Required,
                    message: 'Vui lòng nhập email',
                },
                {
                    type: FormRuleType.Email,
                    message: 'Email không đúng định dạng',
                },
            ],
        },
        {
            name: 'isActive',
            label: 'Trạng thái',
            type: 'switch',
        },
    ];

    return (
        <>
            <ListContainer filters={filters} actions={actions}>
                <ListTable<UserRecord>
                    columns={columns}
                    tableProps={tableProps}
                    tableQuery={tableQuery}
                    deleteResource={RESOURCE.USERS}
                    onEdit={(record) => editModalForm.show(record.id)}
                />
            </ListContainer>

            <FormModalContainer
                modalForm={createModalForm}
                title="Thêm mới người dùng"
                sections={[{ type: 'plain', fields: formFields }]}
                createInitialValues={{ userName: '', email: '', isActive: true }}
            />
            <FormModalContainer
                modalForm={editModalForm}
                title="Chỉnh sửa người dùng"
                sections={[{ type: 'plain', fields: formFields }]}
            />
        </>
    );
}
