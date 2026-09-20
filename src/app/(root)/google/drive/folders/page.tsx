'use client';

import { Icon } from '@iconify/react';

import { ColumnsType, CustomButton } from '@/components';
import {
    FilterPanel,
    type ICardAction,
    type IFilterField,
    ListContainer,
    ListTable,
} from '@/components';
import { RESOURCE } from '@/config';
import { formatDate } from '@/libs';

import { GoogleDriveType } from '../enums';
import { FolderModal, SyncGoogleDrive } from './components';
import { useGoogleFolderPage } from './hooks';
import type { GoogleFolderRecord } from './types';

const FolderPage = () => {
    const {
        modalForm,
        table,
        folderOptions,
        isOpenSyncFile,
        queryFolderOptions,
        debouncedSearch,
        setIsOpenSyncFile,
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

    const actions: ICardAction[] = [
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
            <ListContainer
                actions={actions}
                isLoading={table.tableQuery.isLoading}
                filters={<FilterPanel fields={filters} />}
            >
                <ListTable<GoogleFolderRecord>
                    columns={columns}
                    table={table}
                    deleteResource={RESOURCE.GOOGLE_FOLDERS}
                    onEdit={(record) => modalForm.show(record?.id)}
                />
            </ListContainer>

            <FolderModal modalForm={modalForm} folderOptions={folderOptions ?? []} />

            <SyncGoogleDrive
                isOpen={isOpenSyncFile}
                defaultType={GoogleDriveType.FOLDER}
                onClose={() => setIsOpenSyncFile(false)}
                defaultFolderOptions={folderOptions || []}
                queryLoading={queryFolderOptions?.isLoading}
                onSuccess={() => table.tableQuery?.refetch()}
            />
        </>
    );
};

export default FolderPage;
