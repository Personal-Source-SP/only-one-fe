// eslint-disable-next-line react-hooks/exhaustive-deps

'use client';

import DataNotFound from '@/components/common/data-not-found';
import PaginationControls from '@/components/module/photos/PaginationControls';
import PhotoButton from '@/components/module/photos/PhotoButton';
import PhotoFilter from '@/components/module/photos/PhotoFilter';
import PhotoGroups from '@/components/module/photos/PhotoGroups';
import { useMainContext } from '@/contexts/MainContext';
import { PhotoItemsPerPage, SortOrder, ViewMode } from '@/enums';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import type { NGoogleDrive, NPhoto } from '@/interfaces';
import { useListFiles, useListFolders } from '@/query/google-drive.query';
import { FC, useEffect, useMemo, useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';

const PhotosPage: FC = () => {
    const [columns, setColumns] = useState(4);

    const { handleLoading } = useMainContext();
    const { isAuthenticated, login } = useGoogleAuth();

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [itemsPerPage, setItemsPerPage] = useState<PhotoItemsPerPage>(PhotoItemsPerPage.TWENTY);
    const [pageTokens, setPageTokens] = useState<Record<number, string | undefined>>({
        1: undefined,
    });

    const [isOpenFilter, setIsOpenFilter] = useState(false);
    const [searchQuery, setSearchQuery] = useState<string>();
    const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.TIME);
    const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.NEWEST);
    const [filterFolder, setFilterFolder] = useState<string | undefined>(undefined);

    const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
    const [slideshowInterval, setSlideshowInterval] = useState<number>(5);

    const { data: filesResponse } = useListFiles(
        {
            spaces: 'drive',
            pageSize: itemsPerPage,
            orderBy: sortOrder === 'newest' ? 'createdTime desc' : 'createdTime asc',
            q: [
                "mimeType contains 'image/'",
                'trashed=false',
                searchQuery ? `name contains '${searchQuery.replace(/'/g, "\\'")}'` : null,
                filterFolder ? `'${filterFolder}' in parents` : null,
            ]
                .filter(Boolean)
                .join(' and '),
            pageToken: pageTokens[currentPage],
            fields: 'files(id,name,mimeType,thumbnailLink,webContentLink,createdTime),nextPageToken',
        },
        {
            retry: false,
            enabled: isAuthenticated,
            refetchOnWindowFocus: false,
        },
    );

    const { data: foldersData } = useListFolders(undefined, {
        retry: false,
        enabled: isAuthenticated,
        refetchOnWindowFocus: false,
    });

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

    useEffect(() => {
        setCurrentPage(1);
        setPageTokens({ 1: undefined });
    }, [itemsPerPage, searchQuery]);

    useEffect(() => {
        const nextToken = filesResponse?.data?.nextPageToken;
        if (nextToken && pageTokens[currentPage + 1] !== nextToken) {
            setPageTokens((prev) => ({ ...prev, [currentPage + 1]: nextToken }));
        }
    }, [filesResponse?.data?.nextPageToken, currentPage]);

    const [allPhotos, hasNextPage, totalPages] = useMemo(() => {
        const driveFiles: NGoogleDrive.DriveFileResponse[] = filesResponse?.data?.files ?? [];

        const allPhotos: NPhoto.Photo[] = (driveFiles || []).map((file, index) => ({
            id: index + 1,
            date: new Date(file?.createdTime || Date.now()),
            url: (file?.thumbnailLink || file?.webContentLink || '').toString(),
        }));

        const hasNextPage = Boolean(filesResponse?.data?.nextPageToken);
        const totalPages = currentPage + (hasNextPage ? 1 : 0);

        return [allPhotos, hasNextPage, totalPages];
    }, [filesResponse?.data?.files]);

    const groupedPhotos = useMemo(() => {
        if (viewMode === ViewMode.ALL) return [{ date: 'Tất cả ảnh', photos: allPhotos }];

        const groups = allPhotos.reduce<{ [key: string]: NPhoto.Photo[] }>((acc, photo) => {
            const dateKey = photo.date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });

            if (!acc[dateKey]) acc[dateKey] = [];

            acc[dateKey].push(photo);

            return acc;
        }, {});

        return Object.entries(groups).map(([date, photos]) => ({ date, photos }));
    }, [allPhotos, viewMode]);

    const startSlideshow = () => {
        setIsLightboxOpen(true);
    };

    const stopSlideshow = () => {
        setIsLightboxOpen(false);
    };

    const openLightbox = (index: number) => {
        setCurrentIndex(index);
        setIsLightboxOpen(true);
    };

    const closeLightbox = () => {
        setIsLightboxOpen(false);
    };

    const handlePhotoClick = (url: string) => {
        const index = allPhotos.findIndex((photo) => photo.url === url);
        openLightbox(index);
    };

    if (!isAuthenticated) {
        return (
            <div className="space-y-6">
                <DataNotFound
                    loading
                    onRetry={() => login('photos')}
                    message="Vui lòng kiểm tra kết nối hoặc thử lại sau."
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PhotoButton
                searchQuery={searchQuery}
                startSlideshow={startSlideshow}
                setSearchQuery={setSearchQuery}
                setIsOpenFilter={setIsOpenFilter}
            />

            <PhotoFilter
                viewMode={viewMode}
                isOpen={isOpenFilter}
                sortOrder={sortOrder}
                onClose={setIsOpenFilter}
                filterFolder={filterFolder}
                folders={foldersData?.data?.files ?? []}
                onApplyFilters={(filter: NPhoto.Filter) => {
                    setCurrentPage(1);
                    setPageTokens({ 1: undefined });

                    setViewMode(filter.viewMode);
                    setSortOrder(filter.sortOrder);
                    setFilterFolder(filter.folderId);
                }}
            />

            <PhotoGroups
                columns={columns}
                groupedPhotos={groupedPhotos}
                onPhotoClick={handlePhotoClick}
            />

            <PaginationControls
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalItems={totalPages * itemsPerPage}
                onPageChange={(page) => {
                    if (page === currentPage) return;

                    if (page < currentPage || (page === currentPage + 1 && hasNextPage)) {
                        setCurrentPage(page);
                    }
                }}
                onItemsPerPageChange={(n) => {
                    setItemsPerPage(n);
                    setCurrentPage(1);
                    setPageTokens({ 1: undefined });
                }}
            />

            <Lightbox
                index={currentIndex}
                open={isLightboxOpen}
                slides={allPhotos.map((p) => ({ src: p.url }))}
                plugins={[Fullscreen, Slideshow, Thumbnails, Zoom]}
                close={() => {
                    closeLightbox();
                    stopSlideshow();
                }}
                slideshow={{
                    delay: slideshowInterval * 1000,
                }}
            />
        </div>
    );
};

export default PhotosPage;
