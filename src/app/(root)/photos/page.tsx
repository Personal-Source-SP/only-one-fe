'use client';

import { ElementType, SortOrder, ViewMode } from '@/enums';
import type { NBaseApi, NGoogle } from '@/interfaces';
import { Icon } from '@iconify/react';
import { useTable } from '@refinedev/antd';
import { HttpError, useApiUrl, useCustom, useCustomMutation, useSelect } from '@refinedev/core';
import { Button, Input, message, Space } from 'antd';
import { isNumber } from 'lodash';
import { FC, useEffect, useMemo, useState } from 'react';

import Lightbox from 'yet-another-react-lightbox';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';

import { CustomElement, PaginationControls } from '@/components/common';

import PhotoFilter from '@/components/module/photos/PhotoFilter';
import PhotoGroups from '@/components/module/photos/PhotoGroups';
import SyncFileGoogleDrive from '@/components/module/photos/SyncGoogleDrive';
import { useMainContext } from '@/contexts/MainContext';
import { exchangeCodeForTokens } from '@/libs/googleapis';
import { useSearchParams } from 'next/navigation';

const PhotosPage: FC = () => {
    const apiUrl = useApiUrl();
    const searchParams = useSearchParams();

    const { handleLoading } = useMainContext();

    const [columns, setColumns] = useState(4);
    const [isOpenFilter, setIsOpenFilter] = useState(false);
    const [searchQuery, setSearchQuery] = useState<string>();
    const [isOpenSyncFile, setIsOpenSyncFile] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.ALL);
    const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.NEWEST);
    const [filterFolder, setFilterFolder] = useState<string | undefined>(undefined);

    const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
    const [slideshowInterval, setSlideshowInterval] = useState<number>(5);

    const { currentPage, setCurrentPage, pageSize, setPageSize, tableQuery } = useTable<
        NGoogle.IGoogleDriveFile,
        HttpError,
        Partial<NGoogle.IGoogleDriveFile>
    >({
        resource: 'google-drive/files',
        syncWithLocation: false,
        pagination: {
            pageSize: 30,
            mode: 'server',
        },
        sorters: {
            mode: 'server',
            initial: [{ field: 'createdAt', order: 'desc' }],
        },
    });

    const { options: folderOptions, query: queryFolderOptions } =
        useSelect<NGoogle.IGoogleDriveFolder>({
            resource: 'google-drive/folders/all',
            optionValue: (item: NGoogle.IGoogleDriveFolder) => item.id,
            optionLabel: (item: NGoogle.IGoogleDriveFolder) => item.name,
            queryOptions: {
                enabled: false,
            },
        });

    const { result: googleAuth, query } = useCustom<NBaseApi.IResponse<NGoogle.IGoogleAuth>>({
        url: `${apiUrl}/google-auth`,
        method: 'get',
        queryOptions: {
            enabled: isOpenSyncFile,
        },
    });

    const { mutate: syncGoogleAuth } = useCustomMutation<NBaseApi.IResponse<boolean>>();

    const allPhotos = useMemo(() => {
        return tableQuery?.data?.data ?? [];
    }, [tableQuery?.data?.data]);

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
        queryFolderOptions?.refetch();
    }, []);

    useEffect(() => {
        if (!searchParams) return;

        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
            message.error('Kết nối Google thất bại');
            return;
        }

        if (code) {
            handleSaveToken(code as string);
        }
    }, [searchParams]);

    const handleSaveToken = async (code: string) => {
        handleLoading(true);

        try {
            const tokens = await exchangeCodeForTokens(
                code,
                process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI as string,
            );

            if (!tokens) {
                message.error('Lỗi khi lấy token Google');
                return;
            }

            syncGoogleAuth({
                method: 'put',
                url: `${apiUrl}/google-auth`,
                values: {
                    accessToken: tokens.access_token,
                    expiresIn: tokens.expires_in,
                    scope: tokens.scope,
                    tokenType: tokens.token_type,
                    refreshToken: tokens.refresh_token,
                    refreshTokenExpiresIn: tokens.refresh_token_expires_in,
                },
                successNotification: (data) => {
                    if (!data?.data?.data) {
                        return {
                            type: 'error',
                            message: 'Kết nối Google thất bại',
                        };
                    }

                    window.location.href = '/photos';

                    return {
                        type: 'success',
                        message: 'Kết nối Google thành công',
                    };
                },
                errorNotification: () => {
                    return {
                        type: 'error',
                        message: 'Kết nối Google thất bại',
                    };
                },
            });
        } catch (e) {
            message.error('Lỗi khi kết nối Google');
        } finally {
            handleLoading(false);
        }
    };

    const startSlideshow = () => {
        setIsLightboxOpen(true);
    };

    const stopSlideshow = () => {
        setIsLightboxOpen(false);
    };

    const openLightbox = (index: number) => {
        setCurrentPage(index);
        setIsLightboxOpen(true);
    };

    const closeLightbox = () => {
        setIsLightboxOpen(false);
    };

    const handlePhotoClick = (url: string) => {
        const index = allPhotos?.findIndex((photo) => photo.webContentLink === url);
        if (isNumber(index)) {
            openLightbox(index ?? 0);
        }
    };

    return (
        <Space size="middle" direction="vertical" className="w-full h-full">
            <CustomElement
                title="Photos"
                elementType={ElementType.TITLE}
                actions={[
                    <Button
                        key="filter"
                        type="primary"
                        onClick={() => setIsOpenFilter(true)}
                        icon={<Icon icon="lucide:settings-2" />}
                    >
                        Bộ lọc
                    </Button>,
                    <Button
                        key="slideshow"
                        type="primary"
                        onClick={startSlideshow}
                        icon={<Icon icon="lucide:play" />}
                    >
                        Trình chiếu
                    </Button>,
                    <Button
                        key="sync"
                        type="primary"
                        icon={<Icon icon="mdi:sync" />}
                        onClick={() => setIsOpenSyncFile(true)}
                    >
                        Đồng bộ hoá
                    </Button>,
                ]}
            />

            <CustomElement elementType={ElementType.CONTAINER}>
                <CustomElement
                    elementType={ElementType.CARD}
                    header={
                        <Input
                            value={searchQuery}
                            placeholder="Tìm kiếm ảnh của bạn..."
                            onChange={(e) => setSearchQuery(e.target.value.trim())}
                            prefix={<Icon icon="lucide:search" className="text-foreground-500" />}
                        />
                    }
                    actions={[
                        <PaginationControls
                            itemsPerPage={pageSize}
                            currentPage={currentPage}
                            totalItems={allPhotos?.length}
                            onPageChange={(page) => setCurrentPage(page)}
                            onItemsPerPageChange={(pageSize) => {
                                setCurrentPage(1);
                                setPageSize(pageSize);
                            }}
                        />,
                    ]}
                >
                    <PhotoGroups
                        columns={columns}
                        displayMode={viewMode}
                        googleDriveFiles={allPhotos}
                        onPhotoClick={handlePhotoClick}
                    />
                </CustomElement>
            </CustomElement>

            <PhotoFilter
                viewMode={viewMode}
                isOpen={isOpenFilter}
                sortOrder={sortOrder}
                onClose={setIsOpenFilter}
                filterFolder={filterFolder}
                folders={tableQuery?.data?.data ?? []}
                onApplyFilters={(filter: NGoogle.IGoogleDriveFolder) => {
                    setCurrentPage(1);
                    // setViewMode(filter.viewMode);
                    // setSortOrder(filter.sortOrder);
                    // setFilterFolder(filter.folderId);
                }}
            />

            <Lightbox
                index={currentPage}
                open={isLightboxOpen}
                slideshow={{ delay: slideshowInterval * 1000 }}
                plugins={[Fullscreen, Slideshow, Thumbnails, Zoom]}
                // slides={allPhotos?.map((p) => ({ src: p.webContentLink ?? '' }))}
                close={() => {
                    closeLightbox();
                    stopSlideshow();
                }}
            />

            {isOpenSyncFile && (
                <SyncFileGoogleDrive
                    folderOptions={folderOptions}
                    isLoadingGoogleAuth={query?.isLoading}
                    onSuccess={() => tableQuery?.refetch()}
                    onClose={() => setIsOpenSyncFile(false)}
                    googleAuth={googleAuth?.data?.data ?? undefined}
                />
            )}
        </Space>
    );
};

export default PhotosPage;
