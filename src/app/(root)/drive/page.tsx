'use client';

import { CustomElement, CustomFilter, PaginationControls } from '@/components/common';
import CustomTable from '@/components/common/custom-table';
import { CustomFilterType, ElementType } from '@/enums';
import { useDebounceSearch } from '@/hooks/useDebounceSearch';
import { ActionTableItem, FilterItem, NGoogle } from '@/interfaces';
import { Icon } from '@iconify/react';
import { useTable } from '@refinedev/antd';
import { HttpError } from '@refinedev/core';
import { Button, Space } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { FC, useMemo } from 'react';

const DrivePage: FC = () => {
    const {
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        setFilters,
        setSorters,
        tableQuery,
        tableProps,
    } = useTable<NGoogle.IGoogleDriveFolder, HttpError, Partial<NGoogle.IGoogleDriveFolder>>({
        resource: 'google-drive/folders',
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

    const googleDriveFolders = useMemo(() => {
        return tableQuery?.data?.data ?? [];
    }, [tableQuery?.data?.data]);

    const debouncedSearch = useDebounceSearch({
        setFilters,
        setCurrentPage,
        fieldName: 'name',
    });

    const filterItems: FilterItem[] = [
        {
            span: 16,
            type: CustomFilterType.SEARCH,
            placeholder: 'Tìm kiếm thư mục',
            onChange: (value) => debouncedSearch(value as string),
        },
        // {
        //     span: 4,
        //     value: viewMode,
        //     placeholder: 'Dạng xem',
        //     type: CustomFilterType.SELECT,
        //     onChange: (value) => setViewMode(value as 'card' | 'table'),
        //     options: [
        //         { value: 'card', label: 'Dạng thẻ' },
        //         { value: 'table', label: 'Dạng bảng' },
        //     ],
        // },
    ];

    const columns: ColumnsType<NGoogle.IGoogleDriveFolder> = [
        {
            title: 'Tên thư mục',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
            sorter: true,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            sorter: true,
            render: (createdAt: Date) =>
                createdAt ? dayjs(createdAt).format('DD/MM/YYYY HH:mm:ss') : '---',
        },
        {
            key: 'lastModified',
            title: 'Ngày chỉnh sửa',
            dataIndex: 'lastModified',
            sorter: true,
            render: (lastModified: Date) =>
                lastModified ? dayjs(lastModified).format('DD/MM/YYYY HH:mm:ss') : '---',
        },
        {
            key: 'isTrashed',
            title: 'Đã xóa',
            align: 'center',
            dataIndex: 'isTrashed',
            render: (isTrashed: boolean) =>
                isTrashed ? <Icon icon="lucide:check" /> : <Icon icon="lucide:x" />,
        },
        {
            key: 'isStarred',
            title: 'Gắn sao',
            align: 'center',
            dataIndex: 'isStarred',
            render: (isStarred: boolean) =>
                isStarred ? <Icon icon="lucide:check" /> : <Icon icon="lucide:x" />,
        },
    ];

    const actionItems: ActionTableItem[] = [
        {
            key: 'delete',
            label: 'Xóa',
            icon: <Icon icon="lucide:trash" />,
            onClick: (record) => console.log(record),
        },
    ];

    return (
        <Space size="middle" direction="vertical" className="w-full h-full">
            <CustomElement
                title="Danh sách thư mục"
                elementType={ElementType.TITLE}
                actions={[
                    <Button
                        type="primary"
                        key="sync google drive"
                        icon={<Icon icon="ic:baseline-sync" />}
                        // onClick={() => setIsOpenSyncFile(true)}
                    >
                        Đồng bộ từ Google Drive
                    </Button>,
                    <Button
                        type="primary"
                        key="sync-local"
                        icon={<Icon icon="lucide:folder-plus" />}
                        // onClick={() => setIsOpenSyncLocal(true)}
                    >
                        Đồng bộ từ máy tính
                    </Button>,
                ]}
            />

            <CustomElement elementType={ElementType.CONTAINER} loading={tableQuery?.isLoading}>
                <CustomElement
                    elementType={ElementType.CARD}
                    header={<CustomFilter filters={filterItems} />}
                    actions={[
                        <PaginationControls
                            itemsPerPage={pageSize}
                            currentPage={currentPage}
                            totalItems={googleDriveFolders?.length}
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
                        tableProps={tableProps}
                        setSorters={setSorters}
                        setPageSize={setPageSize}
                        actionItems={actionItems}
                        setCurrentPage={setCurrentPage}
                        loading={tableQuery?.isLoading}
                    />
                </CustomElement>
            </CustomElement>
        </Space>
    );
};

export default DrivePage;
