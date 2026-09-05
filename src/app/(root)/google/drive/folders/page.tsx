'use client';

import { Icon } from '@iconify/react';
import { ColumnsType, CustomButton } from '@/components/custom-antd';
import {
    FilterPanel,
    ListTable,
    ListWrapper,
    type CardAction,
    type IFilterField,
} from '@/components/common';
import { formatDate } from '@/libs';
import { RESOURCE } from '@/config';

import { GoogleDriveType } from '../enums';
import { useGoogleFolderPage } from './hooks';
import { FolderModal, SyncGoogleDrive } from './components';
import type { GoogleFolderRecord } from './types';

const FolderPage = () => {
    const {
        tableProps,
        tableQuery,
        debouncedSearch,
        isOpenSyncFile,
        setIsOpenSyncFile,
        modalPropsData,
        folderOptions,
        queryFolderOptions,
    } = useGoogleFolderPage();

    const columns: ColumnsType<GoogleFolderRecord> = [
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
            render: (createdAt: Date) => formatDate(createdAt),
        },
        {
            key: 'lastModified',
            title: 'Ngày chỉnh sửa',
            dataIndex: 'lastModified',
            sorter: true,
            render: (lastModified: Date) => formatDate(lastModified),
        },
        {
            key: 'isTrashed',
            title: 'Đã xóa',
            align: 'center',
            dataIndex: 'isTrashed',
            render: (isTrashed: boolean) =>
                isTrashed ? (
                    <Icon icon="lucide:check" className="w-full" />
                ) : (
                    <Icon icon="lucide:x" className="w-full" />
                ),
        },
        {
            key: 'isStarred',
            title: 'Gắn sao',
            align: 'center',
            dataIndex: 'isStarred',
            render: (isStarred: boolean) =>
                isStarred ? (
                    <Icon icon="lucide:check" className="w-full" />
                ) : (
                    <Icon icon="lucide:x" className="w-full" />
                ),
        },
    ];

    const actions: CardAction[] = [
        {
            component: (
                <CustomButton
                    type="primary"
                    key="sync-google-drive"
                    title="Đồng bộ từ Google Drive"
                    icon={<Icon icon="ic:baseline-sync" />}
                    onClick={() => setIsOpenSyncFile(true)}
                >
                    Đồng bộ
                </CustomButton>
            ),
        },
    ];

    const filters: IFilterField[] = [
        {
            name: 'search',
            type: 'input',
            placeholder: 'Tìm kiếm thư mục...',
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
                <ListTable<GoogleFolderRecord>
                    columns={columns}
                    tableProps={tableProps}
                    tableQuery={tableQuery}
                    deleteResource={RESOURCE.GOOGLE_FOLDERS}
                    onEdit={(record) => modalPropsData?.show?.(record?.id)}
                />
            </ListWrapper>

            <FolderModal
                modalPropsData={modalPropsData}
                folderOptions={folderOptions ?? []}
                onSubmit={() => {}}
            />

            <SyncGoogleDrive
                isOpen={isOpenSyncFile}
                defaultType={GoogleDriveType.FOLDER}
                onClose={() => setIsOpenSyncFile(false)}
                defaultFolderOptions={folderOptions || []}
                queryLoading={queryFolderOptions?.isLoading}
                onSuccess={() => tableQuery?.refetch()}
            />
        </>
    );
};

export default FolderPage;
