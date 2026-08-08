'use client';

import { useMemo } from 'react';
import { Icon } from '@iconify/react';
import { FileGroups, MediaLightbox } from '@/components/common';
import { CustomButton } from '@/components/custom';
import {
    FilterPanel,
    ListWrapper,
    type CardAction,
    type IFilterField,
} from '@/components/custom-container';
import { GoogleDriveType, QualityMode } from '@/enums';
import type { NGoogle } from '@/interfaces';
import { getDriveImageUrl } from '@/libs';

import { usePhotosPage } from './hooks';
import { SyncGoogleDrive, SyncLocal } from './components';

const PhotosPage = () => {
    const {
        columns,
        viewMode,
        isOpenSyncFile,
        setIsOpenSyncFile,
        isOpenSyncLocal,
        setIsOpenSyncLocal,
        isLightboxOpen,
        setIsLightboxOpen,
        currentPhotoIndex,
        tableProps,
        tableQuery,
        debouncedSearch,
        googleDriveFiles,
        googleAuthNotExpired,
        photoItems,
        folderOptions,
        queryFolderOptions,
        queryGoogleAuths,
        handlePhotoClick,
        filterItems,
    } = usePhotosPage();

    const actions = useMemo<CardAction[]>(
        () => [
            {
                component: (
                    <CustomButton
                        type="primary"
                        key="slideshow"
                        title="Trình chiếu"
                        icon={<Icon icon="lucide:play" />}
                        onClick={() => setIsLightboxOpen(true)}
                    >
                        Trình chiếu
                    </CustomButton>
                ),
            },
            {
                component: (
                    <CustomButton
                        type="primary"
                        key="sync-google-drive"
                        title="Đồng bộ từ Google Drive"
                        icon={<Icon icon="ic:baseline-sync" />}
                        onClick={() => setIsOpenSyncFile(true)}
                    >
                        Đồng bộ Drive
                    </CustomButton>
                ),
            },
            {
                component: (
                    <CustomButton
                        type="primary"
                        key="sync-local"
                        title="Đồng bộ từ máy tính"
                        icon={<Icon icon="lucide:folder-plus" />}
                        onClick={() => setIsOpenSyncLocal(true)}
                    >
                        Đồng bộ máy
                    </CustomButton>
                ),
            },
        ],
        [setIsLightboxOpen, setIsOpenSyncFile, setIsOpenSyncLocal],
    );

    const filters = useMemo<IFilterField[]>(
        () => [
            {
                name: 'search',
                type: 'input',
                placeholder: 'Tìm kiếm ảnh...',
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
                <FileGroups
                    columns={columns}
                    data={photoItems}
                    displayMode={viewMode}
                    onClickFile={handlePhotoClick}
                />
            </ListWrapper>

            <MediaLightbox
                isOpen={isLightboxOpen}
                index={currentPhotoIndex}
                closeLightbox={() => setIsLightboxOpen(false)}
                slides={(googleDriveFiles || [])?.map((p) => ({
                    src: getDriveImageUrl(p as NGoogle.IGoogleDriveFile, QualityMode.LOW),
                }))}
            />

            <SyncGoogleDrive
                isOpen={isOpenSyncFile}
                defaultType={GoogleDriveType.FILE}
                onSuccess={() => tableQuery?.refetch()}
                onClose={() => setIsOpenSyncFile(false)}
                defaultFolderOptions={folderOptions ?? []}
                defaultGoogleAuths={googleAuthNotExpired ?? []}
                queryLoading={queryGoogleAuths?.isLoading || queryFolderOptions?.isLoading}
            />

            <SyncLocal
                isOpen={isOpenSyncLocal}
                folderOptions={folderOptions || []}
                onSuccess={() => tableQuery?.refetch()}
                onClose={() => setIsOpenSyncLocal(false)}
                queryLoading={queryGoogleAuths?.isLoading || queryFolderOptions?.isLoading}
            />
        </>
    );
};

export default PhotosPage;
