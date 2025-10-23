'use client';

import { CustomElement, TableContainer } from '@/components/custom';
import { ElementType } from '@/enums';
import { NGoogle, NUser } from '@/interfaces';
import { Icon } from '@iconify/react';
import { useModalForm } from '@refinedev/antd';
import { HttpError } from '@refinedev/core';
import { Space } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { FC, useState } from 'react';

const UsersPage: FC = () => {
    const [quantityRefetch, setQuantityRefetch] = useState(0);
    const [isOpenSyncFile, setIsOpenSyncFile] = useState(false);

    const {
        open: openFolderModal,
        show: showFolderModal,
        close: closeFolderModal,
        formProps: folderModalFormProps,
        modalProps: folderModalModalProps,
        formLoading: folderModalFormLoading,
    } = useModalForm<NUser.IUser, HttpError, Partial<NUser.IUser>>({
        action: 'edit',
        resource: 'users',
        autoResetForm: true,
        warnWhenUnsavedChanges: false,
    });

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
            render: (createdAt: Date) =>
                createdAt ? dayjs(createdAt).format('DD/MM/YYYY HH:mm:ss') : '---',
        },
    ];

    return (
        <Space size="middle" direction="vertical" className="w-full h-full">
            <CustomElement
                title="Danh sách người dùng"
                elementType={ElementType.TITLE}
                actions={
                    [
                        // <Button
                        //     type="primary"
                        //     key="sync google drive"
                        //     icon={<Icon icon="ic:baseline-sync" />}
                        //     onClick={() => setIsOpenSyncFile(true)}
                        // >
                        //     Đồng bộ từ Google Drive
                        // </Button>,
                    ]
                }
            />

            <TableContainer
                columns={columns}
                resource="users"
                quantityRefetch={quantityRefetch}
                actionItems={[
                    {
                        key: 'edit',
                        label: 'Chỉnh sửa',
                        icon: <Icon icon="lucide:edit" />,
                        onClick: (record) => showFolderModal(record?.id),
                    },
                ]}
                filterSearch={{
                    name: 'userName',
                    placeholder: 'Tìm kiếm người dùng',
                }}
            />

            {/* <FolderModal
                open={openFolderModal}
                onClose={closeFolderModal}
                formProps={folderModalFormProps}
                isLoading={folderModalFormLoading}
                modalProps={folderModalModalProps}
                folderOptions={folderOptions ?? []}
                onSubmit={() => {}}
            /> */}
        </Space>
    );
};

export default UsersPage;
