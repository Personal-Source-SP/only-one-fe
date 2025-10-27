'use client';

import { CustomElement, TableContainer } from '@/components/custom';
import { ElementType } from '@/enums';
import { useCustomModal, useTableContainer } from '@/hooks';
import { NGoogle, NUser } from '@/interfaces';
import { Icon } from '@iconify/react';
import { Space } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { FC, useState } from 'react';

const UsersPage: FC = () => {
    const [quantityRefetch, setQuantityRefetch] = useState(0);

    const tableContainerData = useTableContainer({
        resource: 'users',
    });

    const modalPropsData = useCustomModal({
        action: 'edit',
        resource: 'users',
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
            <CustomElement title="Danh sách người dùng" elementType={ElementType.TITLE} />

            <TableContainer
                resource="users"
                columns={columns}
                quantityRefetch={quantityRefetch}
                tableContainerData={tableContainerData}
                actionItems={[
                    {
                        key: 'edit',
                        label: 'Chỉnh sửa',
                        icon: <Icon icon="lucide:edit" />,
                        onClick: (record) => modalPropsData?.show?.(record?.id),
                    },
                ]}
                filterSearch={{
                    name: 'userName',
                    placeholder: 'Tìm kiếm người dùng',
                }}
            />
        </Space>
    );
};

export default UsersPage;
