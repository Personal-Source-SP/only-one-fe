'use client';

import { DataTableContainer, MediaLightbox, FileGroups } from '@/components/common';
import { CustomButton } from '@/components/custom';
import { CustomFilterType, GoogleDriveType, MimeType, QualityMode, ViewFileMode } from '@/enums';
import type { FileItem, FilterItem, NGoogle } from '@/interfaces';
import { Icon } from '@iconify/react';
import { isNumber } from 'lodash';
import { useEffect, useMemo, useState } from 'react';

import { SyncGoogleDrive } from '@/app/(root)/google/drive/components/sync-google-drive';
import { SyncLocal } from '@/app/(root)/google/drive/components/sync-local';

import { useCustomData, useSelectGoogleFolder, useTableContainer } from '@/hooks';
import { getDriveImageUrl, isExpiredToken } from '@/libs';

type FilterOptions = NonNullable<FilterItem['options']>;

type PhotoFilterItemsParams = {
    columns: number;
    viewMode: ViewFileMode;
    qualityMode: QualityMode;
    folderOptions: FilterOptions;
    googleAuthOptions: FilterOptions;
    onAuthChange: (value: string[]) => void;
    onFolderChange: (value: string[]) => void;
    onViewModeChange: (value: ViewFileMode) => void;
    onQualityModeChange: (value: QualityMode) => void;
    onColumnsChange: (value: number) => void;
};

const PhotosPage = () => {
    const [columns, setColumns] = useState(4);
    const [viewMode, setViewMode] = useState<ViewFileMode>(ViewFileMode.ALL);
    const [qualityMode, setQualityMode] = useState<QualityMode>(QualityMode.LOW);

    const [isOpenSyncFile, setIsOpenSyncFile] = useState(false);
    const [isOpenSyncLocal, setIsOpenSyncLocal] = useState(false);

    const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);

    const tableContainerData = useTableContainer({
        resource: 'google-file',
        defaultFilters: [{ field: 'mimeType', operator: 'contains', value: MimeType.IMAGE }],
    });

    const { result: googleAuthsResult, query: queryGoogleAuths } = useCustomData({
        url: 'google-auth',
        enabled: false,
    });

    const { options: folderOptions, query: queryFolderOptions } = useSelectGoogleFolder({
        enabled: false,
    });

    const { tableQuery, setCurrentPage, setFilters } = tableContainerData;

    const googleDriveFiles = useMemo<NGoogle.IGoogleDriveFile[]>(() => {
        if (!tableQuery?.data?.data?.length) return [];

        return tableQuery.data.data as NGoogle.IGoogleDriveFile[];
    }, [tableQuery?.data?.data]);

    const googleAuthOptions = useMemo(() => {
        if (!googleAuthsResult?.data?.data?.length) return [];

        const options = googleAuthsResult?.data?.data?.map((item: NGoogle.IGoogleAuth) => ({
            value: item.id,
            label: item.email,
        }));

        return options;
    }, [googleAuthsResult?.data?.data]);

    const googleAuthNotExpired = useMemo(() => {
        if (!googleAuthsResult?.data?.data?.length) return [];

        return googleAuthsResult?.data?.data?.filter(
            (item: NGoogle.IGoogleAuth) => !isExpiredToken(item.googleExpiresAt),
        );
    }, [googleAuthsResult?.data?.data]);

    const photoItems: FileItem[] = useMemo(() => {
        if (!googleDriveFiles?.length) return [];

        return googleDriveFiles?.map((file) => ({
            id: String(file.id ?? ''),
            mimeType: file.mimeType ?? '',
            url: getDriveImageUrl(file as NGoogle.IGoogleDriveFile, qualityMode),
            lastModified: file.lastModified ?? new Date(),
            folderName: file.googleDriveFolder?.name ?? '',
        }));
    }, [googleDriveFiles, qualityMode]);

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

    const openLightbox = (index: number) => {
        setIsLightboxOpen(true);
        setCurrentPhotoIndex(index);
    };

    const handlePhotoClick = (googleDriveFileId: string) => {
        const index = googleDriveFiles?.findIndex((photo) => photo.id === googleDriveFileId);
        if (isNumber(index)) {
            openLightbox(index ?? 0);
        }
    };

    const viewModeOptions: FilterOptions = [
        { value: ViewFileMode.ALL, label: 'Xem tất cả' },
        { value: ViewFileMode.DATE, label: 'Xem theo ngày' },
        { value: ViewFileMode.FOLDER, label: 'Xem theo thư mục' },
    ];

    const qualityModeOptions: FilterOptions = [
        { value: QualityMode.HIGH, label: 'Nét' },
        { value: QualityMode.LOW, label: 'Thường' },
    ];

    const columnOptions: FilterOptions = [1, 2, 3, 4, 8].map((item) => ({
        value: item,
        label: item.toString(),
    }));

    const filterItems = (({
        columns,
        viewMode,
        qualityMode,
        folderOptions,
        googleAuthOptions,
        onAuthChange,
        onFolderChange,
        onViewModeChange,
        onQualityModeChange,
        onColumnsChange,
    }: PhotoFilterItemsParams): FilterItem[] => [
        {
            span: 4,
            value: viewMode,
            placeholder: 'Chế độ xem',
            type: CustomFilterType.SELECT,
            onChange: (value: ViewFileMode) => onViewModeChange(value),
            options: viewModeOptions,
        },
        {
            span: 4,
            value: qualityMode,
            placeholder: 'Độ nét',
            type: CustomFilterType.SELECT,
            onChange: (value: QualityMode) => onQualityModeChange(value),
            options: qualityModeOptions,
        },
        {
            span: 2,
            value: columns,
            placeholder: 'Số cột',
            type: CustomFilterType.SELECT,
            onChange: (value: number) => onColumnsChange(value),
            options: columnOptions,
        },
        {
            span: 12,
            mode: 'multiple',
            allowClear: true,
            showSearch: true,
            placeholder: 'Thư mục',
            type: CustomFilterType.SELECT,
            options: folderOptions,
            onChange: (value: string[]) => onFolderChange(value),
        },
        {
            span: 12,
            mode: 'multiple',
            allowClear: true,
            showSearch: true,
            placeholder: 'Email',
            type: CustomFilterType.SELECT,
            options: googleAuthOptions,
            onChange: (value: string[]) => onAuthChange(value),
        },
    ])({
        columns,
        viewMode,
        qualityMode,
        folderOptions: folderOptions ?? [],
        googleAuthOptions: googleAuthOptions ?? [],
        onAuthChange: (value) => {
            setFilters([{ field: 'googleAuthId', operator: 'eq', value }]);
            setCurrentPage(1);
        },
        onFolderChange: (value) => {
            setFilters([{ field: 'folderId', operator: 'eq', value }]);
            setCurrentPage(1);
        },
        onViewModeChange: setViewMode,
        onQualityModeChange: setQualityMode,
        onColumnsChange: setColumns,
    });

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

    const filterSearch = {
        span: 14,
        name: 'name',
        placeholder: 'Tìm kiếm ảnh',
    };

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
