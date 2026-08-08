'use client';

import { useEffect, useMemo, useState } from 'react';
import { isNumber } from 'lodash';
import { CustomFilterType, MimeType, QualityMode, ViewFileMode } from '@/enums';
import { useCustomData, useCustomTable, useSelectGoogleFolder } from '@/hooks';
import { FileItem, FilterItem, NGoogle } from '@/interfaces';
import { getDriveImageUrl, isExpiredToken } from '@/libs';

import { columnOptions, qualityModeOptions, viewModeOptions } from './constants';

export const usePhotosPage = () => {
    const [columns, setColumns] = useState(4);
    const [viewMode, setViewMode] = useState<ViewFileMode>(ViewFileMode.ALL);
    const [qualityMode, setQualityMode] = useState<QualityMode>(QualityMode.LOW);

    const [isOpenSyncFile, setIsOpenSyncFile] = useState(false);
    const [isOpenSyncLocal, setIsOpenSyncLocal] = useState(false);

    const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);

    const { tableProps, tableQuery, debouncedSearch, setFilters, setCurrentPage } =
        useCustomTable<NGoogle.IGoogleDriveFile>({
            resource: 'google-file',
            filters: {
                initial: [{ field: 'mimeType', operator: 'contains', value: MimeType.IMAGE }],
            },
        });

    const { result: googleAuthsResult, query: queryGoogleAuths } = useCustomData({
        url: 'google-auth',
        enabled: false,
    });

    const { options: folderOptions, query: queryFolderOptions } = useSelectGoogleFolder({
        enabled: false,
    });

    const googleDriveFiles = useMemo<NGoogle.IGoogleDriveFile[]>(() => {
        if (!tableQuery?.data?.data?.length) return [];

        return tableQuery.data.data as NGoogle.IGoogleDriveFile[];
    }, [tableQuery?.data?.data]);

    const googleAuthOptions = useMemo(() => {
        if (!googleAuthsResult?.data?.data?.length) return [];

        return googleAuthsResult?.data?.data?.map((item: NGoogle.IGoogleAuth) => ({
            value: item.id,
            label: item.email,
        }));
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

        return () => window.removeEventListener('resize', updateColumns);
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

    const filterItems: FilterItem[] = [
        {
            span: 4,
            value: viewMode,
            placeholder: 'Chế độ xem',
            type: CustomFilterType.SELECT,
            onChange: (value: ViewFileMode) => setViewMode(value),
            options: viewModeOptions,
        },
        {
            span: 4,
            value: qualityMode,
            placeholder: 'Độ nét',
            type: CustomFilterType.SELECT,
            onChange: (value: QualityMode) => setQualityMode(value),
            options: qualityModeOptions,
        },
        {
            span: 2,
            value: columns,
            placeholder: 'Số cột',
            type: CustomFilterType.SELECT,
            onChange: (value: number) => setColumns(value),
            options: columnOptions,
        },
        {
            span: 12,
            mode: 'multiple',
            allowClear: true,
            showSearch: true,
            placeholder: 'Thư mục',
            type: CustomFilterType.SELECT,
            options: folderOptions ?? [],
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
            type: CustomFilterType.SELECT,
            options: googleAuthOptions ?? [],
            onChange: (value: string[]) => {
                setFilters([{ field: 'googleAuthId', operator: 'eq', value }]);
                setCurrentPage(1);
            },
        },
    ];

    return {
        columns,
        setColumns,
        viewMode,
        setViewMode,
        qualityMode,
        setQualityMode,
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
        setFilters,
        setCurrentPage,
        googleDriveFiles,
        googleAuthNotExpired,
        photoItems,
        folderOptions,
        queryFolderOptions,
        queryGoogleAuths,
        handlePhotoClick,
        filterItems,
    };
};
