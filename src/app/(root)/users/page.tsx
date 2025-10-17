'use client';

import { CustomElement, CustomFilter, PaginationControls } from '@/components/common';
import CustomTable from '@/components/common/custom-table';
import { CustomFilterType, ElementType } from '@/enums';
import { useDebounceSearch } from '@/hooks/useDebounceSearch';
import { ActionTableItem, FilterItem, NGoogle, NUser } from '@/interfaces';
import { Icon } from '@iconify/react';
import { useModalForm, useTable } from '@refinedev/antd';
import { HttpError } from '@refinedev/core';
import { Space } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { FC, useMemo, useState } from 'react';

const UsersPage: FC = () => {
    const [isOpenSyncFile, setIsOpenSyncFile] = useState(false);

    const {
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        setFilters,
        setSorters,
        tableQuery,
        tableProps,
    } = useTable<NUser.IUser, HttpError, Partial<NUser.IUser>>({
        resource: 'users',
        syncWithLocation: false,
        pagination: {
            pageSize: 10,
            mode: 'server',
        },
        sorters: {
            mode: 'server',
            initial: [{ field: 'createdAt', order: 'desc' }],
        },
    });

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

    const users = useMemo(() => {
        return tableQuery?.data?.data ?? [];
    }, [tableQuery?.data?.data]);

    const debouncedSearch = useDebounceSearch({
        setFilters,
        setCurrentPage,
        fieldName: 'userName',
    });

    const actionItems: ActionTableItem[] = [
        {
            key: 'edit',
            label: 'Chỉnh sửa',
            icon: <Icon icon="lucide:edit" />,
            onClick: (record) => showFolderModal(record?.id),
        },
    ];

    const filterItems: FilterItem[] = [
        {
            span: 24,
            type: CustomFilterType.SEARCH,
            placeholder: 'Tìm kiếm người dùng',
            onChange: (value) => debouncedSearch(value as string),
        },
    ];

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
                isActive ? <Icon icon="lucide:check" /> : <Icon icon="lucide:x" />,
        },
        {
            key: 'googleAuth',
            title: 'Kết nối Google',
            dataIndex: 'googleAuths',
            align: 'center',
            render: (googleAuths: NGoogle.IGoogleAuth[]) =>
                googleAuths?.length > 0 ? <Icon icon="lucide:check" /> : <Icon icon="lucide:x" />,
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

            <CustomElement elementType={ElementType.CONTAINER}>
                <CustomElement
                    elementType={ElementType.CARD}
                    header={<CustomFilter filters={filterItems} />}
                    actions={[
                        <PaginationControls
                            itemsPerPage={pageSize}
                            currentPage={currentPage}
                            totalItems={users?.length}
                            onPageChange={(page) => setCurrentPage(page)}
                            onItemsPerPageChange={(pageSize) => {
                                setCurrentPage(1);
                                setPageSize(pageSize);
                            }}
                        />,
                    ]}
                >
                    <CustomTable
                        columns={columns}
                        resource="google-folder"
                        tableProps={tableProps}
                        setSorters={setSorters}
                        setPageSize={setPageSize}
                        actionItems={actionItems}
                        setCurrentPage={setCurrentPage}
                        loading={tableQuery?.isLoading}
                        onRefetch={tableQuery?.refetch}
                    />
                </CustomElement>
            </CustomElement>

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
