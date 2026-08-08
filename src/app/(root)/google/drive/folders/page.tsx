'use client';

import { useMemo } from 'react';
import { Icon } from '@iconify/react';
import { CustomButton } from '@/components/custom';
import {
    FilterPanel,
    ListTable,
    ListWrapper,
    type CardAction,
    type IFilterField,
} from '@/components/custom-container';
import { GoogleDriveType } from '@/enums';
import type { NGoogle } from '@/interfaces';

import { columns } from './constants';
import { useGoogleFolderPage } from './hooks';
import { FolderModal, SyncGoogleDrive } from './components';

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

    const actions = useMemo<CardAction[]>(
        () => [
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
        ],
        [setIsOpenSyncFile],
    );

    const filters = useMemo<IFilterField[]>(
        () => [
            {
                name: 'search',
                type: 'input',
                placeholder: 'Tìm kiếm thư mục...',
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
                <ListTable<NGoogle.IGoogleDriveFolder>
                    columns={columns}
                    tableProps={tableProps}
                    tableQuery={tableQuery}
                    deleteResource="google-folder"
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
