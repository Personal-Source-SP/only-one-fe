'use client';

import {
    CustomFilterType,
    ElementType,
    GoogleDriveType,
    MimeType,
    QualityMode,
    ViewFileMode,
} from '@/enums';
import type { FileItem, FilterItem, NGoogle } from '@/interfaces';
import { Icon } from '@iconify/react';
import { Button, Space } from 'antd';
import { isNumber } from 'lodash';
import { useEffect, useMemo, useState } from 'react';

import { CustomElement, CustomLightBox, TableContainer } from '@/components/custom';

import FileGroups from '@/components/module/file-group';
import SyncGoogleDrive from '@/components/module/sync-google-drive';
import SyncLocal from '@/components/module/sync-local';

import { useCustomData, useSelectGoogleFolder, useTableContainer } from '@/hooks';
import { getDriveImageUrl, isExpiredToken } from '@/libs';

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

    const filterItems: FilterItem[] = [
        {
            span: 4,
            value: viewMode,
            placeholder: 'Chế độ xem',
            type: CustomFilterType.SELECT,
            onChange: (value: ViewFileMode) => setViewMode(value),
            options: [
                { value: ViewFileMode.ALL, label: 'Xem tất cả' },
                { value: ViewFileMode.DATE, label: 'Xem theo ngày' },
                { value: ViewFileMode.FOLDER, label: 'Xem theo thư mục' },
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

    return (
        <Space size="middle" direction="vertical" className="w-full h-full">
            <CustomElement
                title="Photos"
                elementType={ElementType.TITLE}
                actions={[
                    <Button
                        key="slideshow"
                        type="primary"
                        icon={<Icon icon="lucide:play" />}
                        onClick={() => setIsLightboxOpen(true)}
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

            <TableContainer
                resource="google-file"
                customFilterItems={filterItems}
                tableContainerData={tableContainerData}
                filterSearch={{
                    span: 14,
                    name: 'name',
                    placeholder: 'Tìm kiếm ảnh',
                }}
                childrenTop={
                    <FileGroups
                        columns={columns}
                        data={photoItems}
                        displayMode={viewMode}
                        onClickFile={handlePhotoClick}
                    />
                }
            />

            <CustomLightBox
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
        </Space>
    );
};

export default PhotosPage;
