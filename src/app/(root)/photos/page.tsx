'use client';

import {
    CustomFilterType,
    ElementType,
    GoogleDriveFileType,
    GoogleDriveType,
    QualityMode,
    ViewMode,
} from '@/enums';
import type { FilterItem, NBaseApi, NGoogle } from '@/interfaces';
import { Icon } from '@iconify/react';
import { useTable } from '@refinedev/antd';
import { HttpError, useApiUrl, useCustom, useSelect } from '@refinedev/core';
import { Button, Space } from 'antd';
import { isNumber } from 'lodash';
import { FC, useEffect, useMemo, useState } from 'react';

import Lightbox from 'yet-another-react-lightbox';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';

import { CustomElement, CustomTableContainer } from '@/components/common';

import PhotoGroups from '@/components/module/photos/PhotoGroups';
import SyncGoogleDrive from '@/components/module/sync-google-drive';
import SyncLocal from '@/components/module/sync-local';

import { getDriveImageUrl, isExpiredToken } from '@/libs';

const PhotosPage: FC = () => {
    const apiUrl = useApiUrl();

    const [columns, setColumns] = useState(4);
    const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.ALL);
    const [qualityMode, setQualityMode] = useState<QualityMode>(QualityMode.LOW);

    const [isOpenSyncFile, setIsOpenSyncFile] = useState(false);
    const [isOpenSyncLocal, setIsOpenSyncLocal] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
    const [slideshowInterval, setSlideshowInterval] = useState<number>(3);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);

    const { setCurrentPage, setFilters, tableQuery } = useTable<
        NGoogle.IGoogleDriveFile,
        HttpError,
        Partial<NGoogle.IGoogleDriveFile>
    >({
        resource: 'google-file',
        syncWithLocation: false,
        pagination: {
            pageSize: 10,
            mode: 'server',
        },
        sorters: {
            mode: 'server',
            initial: [{ field: 'createdAt', order: 'desc' }],
        },
        filters: {
            initial: [
                { field: 'mimeType', operator: 'contains', value: GoogleDriveFileType.IMAGE },
            ],
        },
    });

    const { result: googleAuthsResult, query: queryGoogleAuths } = useCustom<
        NBaseApi.IResponse<NGoogle.IGoogleAuth[]>
    >({
        url: `${apiUrl}/google-auth`,
        method: 'get',
        queryOptions: {
            enabled: false,
        },
    });

    const { options: folderOptions, query: queryFolderOptions } =
        useSelect<NGoogle.IGoogleDriveFolder>({
            resource: 'google-folder/all',
            optionValue: (item: NGoogle.IGoogleDriveFolder) => item.id,
            optionLabel: (item: NGoogle.IGoogleDriveFolder) => item.name,
            queryOptions: {
                enabled: false,
            },
        });

    const googleDriveFiles = useMemo(() => {
        return tableQuery?.data?.data ?? [];
    }, [tableQuery?.data?.data]);

    const googleAuthOptions = useMemo(() => {
        if (!googleAuthsResult?.data?.data?.length) return [];

        const options = googleAuthsResult?.data?.data?.map((item) => ({
            value: item.id,
            label: item.email,
        }));

        return options;
    }, [googleAuthsResult?.data?.data]);

    const googleAuthNotExpired = useMemo(() => {
        if (!googleAuthsResult?.data?.data?.length) return [];

        return googleAuthsResult?.data?.data?.filter(
            (item) => !isExpiredToken(item.googleExpiresAt),
        );
    }, [googleAuthsResult?.data?.data]);

    useEffect(() => {
        queryGoogleAuths?.refetch();
        queryFolderOptions?.refetch();
    }, []);

    useEffect(() => {
        const updateColumns = () => {
            const width = window.innerWidth;
            if (width < 640) {
                setColumns(2);
            } else if (width < 1024) {
                setColumns(3);
            } else {
                setColumns(4);
            }
        };

        window.addEventListener('resize', updateColumns);

        updateColumns();
    }, []);

    const startSlideshow = () => {
        setIsLightboxOpen(true);
    };

    const stopSlideshow = () => {
        setIsLightboxOpen(false);
    };

    const openLightbox = (index: number) => {
        setIsLightboxOpen(true);
        setCurrentPhotoIndex(index);
    };

    const closeLightbox = () => {
        setIsLightboxOpen(false);
    };

    const handlePhotoClick = (googleDriveFileId: string) => {
        const index = googleDriveFiles?.findIndex((photo) => photo.id === googleDriveFileId);
        if (isNumber(index)) {
            openLightbox(index ?? 0);
        }
    };

    const filterItems: FilterItem[] = [
        {
            span: 4,
            value: viewMode,
            placeholder: 'Chế độ xem',
            type: CustomFilterType.SELECT,
            onChange: (value: ViewMode) => setViewMode(value),
            options: [
                { value: ViewMode.ALL, label: 'Xem tất cả' },
                { value: ViewMode.DATE, label: 'Xem theo ngày' },
                { value: ViewMode.FOLDER, label: 'Xem theo thư mục' },
            ],
        },
        {
            span: 4,
            value: qualityMode,
            placeholder: 'Độ nét',
            type: CustomFilterType.SELECT,
            onChange: (value: QualityMode) => setQualityMode(value),
            options: [
                { value: QualityMode.HIGH, label: 'Nét' },
                { value: QualityMode.LOW, label: 'Thường' },
            ],
        },
        {
            span: 2,
            value: columns,
            placeholder: 'Số cột',
            type: CustomFilterType.SELECT,
            onChange: (value: number) => setColumns(value),
            options: [1, 2, 3, 4, 8].map((item) => ({
                value: item,
                label: item.toString(),
            })),
        },
        {
            span: 12,
            mode: 'multiple',
            allowClear: true,
            showSearch: true,
            value: folderOptions,
            placeholder: 'Thư mục',
            type: CustomFilterType.SELECT,
            onChange: (value: string[]) => {
                setFilters([{ field: 'folderId', operator: 'eq', value }]);
                setCurrentPage(1);
            },
        },
        {
            span: 12,
            mode: 'multiple',
            allowClear: true,
            showSearch: true,
            placeholder: 'Email',
            value: googleAuthOptions,
            type: CustomFilterType.SELECT,
            onChange: (value: string[]) => {
                setFilters([{ field: 'googleAuthId', operator: 'eq', value }]);
                setCurrentPage(1);
            },
        },
    ];

    return (
        <Space size="middle" direction="vertical" className="w-full h-full">
            <CustomElement
                title="Photos"
                elementType={ElementType.TITLE}
                actions={[
                    <Button
                        key="slideshow"
                        type="primary"
                        onClick={startSlideshow}
                        icon={<Icon icon="lucide:play" />}
                    >
                        Trình chiếu
                    </Button>,
                    <Button
                        type="primary"
                        key="sync google drive"
                        icon={<Icon icon="ic:baseline-sync" />}
                        onClick={() => setIsOpenSyncFile(true)}
                    >
                        Đồng bộ từ Google Drive
                    </Button>,
                    <Button
                        type="primary"
                        key="sync-local"
                        icon={<Icon icon="lucide:folder-plus" />}
                        onClick={() => setIsOpenSyncLocal(true)}
                    >
                        Đồng bộ từ máy tính
                    </Button>,
                ]}
            />

            <CustomTableContainer
                resource="google-folder"
                customFilterItems={filterItems}
                filterSearch={{
                    span: 14,
                    name: 'name',
                    placeholder: 'Tìm kiếm ảnh',
                }}
                childrenTop={
                    <PhotoGroups
                        columns={columns}
                        displayMode={viewMode}
                        qualityMode={qualityMode}
                        onPhotoClick={handlePhotoClick}
                        googleDriveFiles={googleDriveFiles}
                    />
                }
            />

            <Lightbox
                open={isLightboxOpen}
                index={currentPhotoIndex}
                slideshow={{ delay: slideshowInterval * 1000 }}
                plugins={[Fullscreen, Slideshow, Thumbnails, Zoom]}
                slides={(googleDriveFiles || [])?.map((p) => ({
                    src: getDriveImageUrl(p, QualityMode.LOW),
                }))}
                close={() => {
                    closeLightbox();
                    stopSlideshow();
                }}
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
        </Space>
    );
};

export default PhotosPage;
