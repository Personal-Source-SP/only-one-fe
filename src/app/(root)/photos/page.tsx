'use client';

import { ElementType, SortOrder, ViewMode } from '@/enums';
import type { NGoogle } from '@/interfaces';
import { Icon } from '@iconify/react';
import { useTable } from '@refinedev/antd';
import { HttpError, useList } from '@refinedev/core';
import { Button, Input, Space } from 'antd';
import { isNumber } from 'lodash';
import { FC, useEffect, useMemo, useState } from 'react';

import Lightbox from 'yet-another-react-lightbox';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';

import { CustomElement } from '@/components/common';

import PaginationControls from '@/components/module/photos/PaginationControls';
import PhotoFilter from '@/components/module/photos/PhotoFilter';
import PhotoGroups from '@/components/module/photos/PhotoGroups';

const PhotosPage: FC = () => {
    const [columns, setColumns] = useState(4);

    const [isOpenFilter, setIsOpenFilter] = useState(false);
    const [searchQuery, setSearchQuery] = useState<string>();
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
        resource: 'google-drive',
        syncWithLocation: false,
        pagination: {
            pageSize: 10,
            mode: 'server',
        },
        sorters: {
            mode: 'server',
            initial: [{ field: 'createdAt', order: 'desc' }],
        },
    });

    const { result: googleDriveFolders } = useList<NGoogle.IGoogleDriveFolder>({
        resource: 'google-drive/folders',
        queryOptions: {
            enabled: true,
        },
        pagination: {
            mode: 'off' as const,
        },
    });

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
    }, []);

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
        const index = tableQuery?.data?.data?.findIndex((photo) => photo.webContentLink === url);
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
                    <Button key="sync" type="primary" icon={<Icon icon="mdi:sync" />}>
                        Đồng bộ hoá
                    </Button>,
                ]}
            />

            <CustomElement elementType={ElementType.CONTAINER}>
                <CustomElement
                    loading={false}
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
                        groupedPhotos={[]}
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
                plugins={[Fullscreen, Slideshow, Thumbnails, Zoom]}
                // slides={allPhotos?.map((p) => ({ src: p.webContentLink ?? '' }))}
                close={() => {
                    closeLightbox();
                    stopSlideshow();
                }}
                slideshow={{
                    delay: slideshowInterval * 1000,
                }}
            />
        </Space>
    );
};

export default PhotosPage;
