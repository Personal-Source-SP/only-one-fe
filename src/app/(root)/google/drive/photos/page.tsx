'use client';

import { DataTableContainer, FileGroups, MediaLightbox } from '@/components/common';
import { CustomButton } from '@/components/custom';
import { GoogleDriveType, QualityMode } from '@/enums';
import type { NGoogle } from '@/interfaces';
import { getDriveImageUrl } from '@/libs';
import { Icon } from '@iconify/react';

import { filterSearch } from './constants';
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
        tableContainerData,
        googleDriveFiles,
        googleAuthNotExpired,
        photoItems,
        folderOptions,
        queryFolderOptions,
        queryGoogleAuths,
        handlePhotoClick,
        filterItems,
    } = usePhotosPage();

    const { tableQuery } = tableContainerData;

    const actionButtons = [
        <CustomButton
            type="primary"
            key="slideshow"
            title="Trình chiếu"
            icon={<Icon icon="lucide:play" />}
            onClick={() => setIsLightboxOpen(true)}
        >
            Trình chiếu
        </CustomButton>,
        <CustomButton
            type="primary"
            key="sync-google-drive"
            title="Đồng bộ từ Google Drive"
            icon={<Icon icon="ic:baseline-sync" />}
            onClick={() => setIsOpenSyncFile(true)}
        >
            Đồng bộ Drive
        </CustomButton>,
        <CustomButton
            type="primary"
            key="sync-local"
            title="Đồng bộ từ máy tính"
            icon={<Icon icon="lucide:folder-plus" />}
            onClick={() => setIsOpenSyncLocal(true)}
        >
            Đồng bộ máy
        </CustomButton>,
    ];

    return (
        <>
            <DataTableContainer
                resource="google-file"
                title="Danh sách ảnh"
                description="Xem và quản lý ảnh từ Google Drive"
                actionButtons={actionButtons}
                customFilterItems={filterItems}
                tableContainerData={tableContainerData}
                filterSearch={filterSearch}
                childrenTop={
                    <FileGroups
                        columns={columns}
                        data={photoItems}
                        displayMode={viewMode}
                        onClickFile={handlePhotoClick}
                    />
                }
            />

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
