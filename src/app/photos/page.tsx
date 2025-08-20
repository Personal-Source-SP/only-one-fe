'use client';

import DataNotFound from '@/components/common/data-not-found';
import LightboxModal from '@/components/module/photos/LightboxModal';
import PaginationControls from '@/components/module/photos/PaginationControls';
import PhotoGroups from '@/components/module/photos/PhotoGroups';
import SlideshowModal from '@/components/module/photos/SlideshowModal';
import PhotosToolbar from '@/components/module/photos/Toolbar';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import type { NGoogleDrive } from '@/interfaces';
import type { Photo } from '@/interfaces/photo';
import { useListFiles } from '@/query/google-drive.query';
import { FC, useEffect, useMemo, useState } from 'react';

const PhotosPage: FC = () => {
    const [columns, setColumns] = useState(4);

    const { isAuthenticated, tokens, login, logout, loading } = useGoogleAuth();

    const [viewMode, setViewMode] = useState<'time' | 'all'>('time');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isSlideshow, setIsSlideshow] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filterFolder, setFilterFolder] = useState<string | null>(null);
    const [itemsPerPage, setItemsPerPage] = useState<number>(12);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
    const [slideshowPaused, setSlideshowPaused] = useState<boolean>(false);
    const [slideshowInterval, setSlideshowInterval] = useState<number>(5);

    const {
        data: filesResponse,
        isError,
        isLoading,
    } = useListFiles(
        {
            pageSize: 200,
            spaces: 'drive',
            orderBy: 'createdTime desc',
            q: "mimeType contains 'image/' and trashed=false",
            fields: 'files(id,name,mimeType,thumbnailLink,webContentLink,createdTime),nextPageToken',
        },
        {
            retry: false,
            enabled: isAuthenticated,
            refetchOnWindowFocus: false,
        },
    );

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
    }, [itemsPerPage]);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout> | undefined;
        if (isSlideshow && !slideshowPaused) {
            timer = setTimeout(() => {
                handleNext();
            }, slideshowInterval * 1000);
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [isSlideshow, slideshowPaused, slideshowInterval, currentIndex]);

    const driveFiles: NGoogleDrive.DriveFileResponse[] = filesResponse?.data?.files ?? [];

    const allPhotos: Photo[] = useMemo(() => {
        return (driveFiles || []).map((file, index) => ({
            id: index + 1,
            url: (file.thumbnailLink || file.webContentLink || '').toString(),
            date: new Date(file.createdTime || Date.now()),
        }));
    }, [driveFiles]);

    const filteredAndSortedPhotos = useMemo(() => {
        let result = allPhotos;
        if (filterFolder) result = result.filter((photo) => photo.folder === filterFolder);
        if (searchQuery)
            result = result.filter((photo) =>
                photo.id.toString().includes(searchQuery.toLowerCase()),
            );
        result.sort((a, b) =>
            sortOrder === 'newest'
                ? b.date.getTime() - a.date.getTime()
                : a.date.getTime() - b.date.getTime(),
        );
        return result;
    }, [allPhotos, filterFolder, searchQuery, sortOrder]);

    const paginatedPhotos = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedPhotos.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredAndSortedPhotos, currentPage, itemsPerPage]);

    const groupedPhotos = useMemo(() => {
        if (viewMode === 'all') return [{ date: 'Tất cả ảnh', photos: paginatedPhotos }];
        const groups: { [key: string]: typeof paginatedPhotos } = {};
        paginatedPhotos.forEach((photo) => {
            const dateKey = photo.date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(photo);
        });
        return Object.entries(groups).map(([date, photos]) => ({ date, photos }));
    }, [paginatedPhotos, viewMode]);

    const startSlideshow = () => {
        setIsSlideshow(true);
        setSlideshowPaused(false);
        setIsLightboxOpen(true);
    };

    const stopSlideshow = () => {
        setIsSlideshow(false);
        setSlideshowPaused(false);
    };

    const toggleSlideshowPause = () => {
        setSlideshowPaused((prev) => !prev);
    };

    const openLightbox = (url: string, index: number) => {
        setSelectedPhoto(url);
        setCurrentIndex(index);
        setIsLightboxOpen(true);
    };

    const closeLightbox = () => {
        setIsLightboxOpen(false);
        setSelectedPhoto(null);
    };

    const handlePhotoClick = (url: string) => {
        const index = allPhotos.findIndex((photo) => photo.url === url);
        openLightbox(url, index);
    };

    const handlePrevious = () => {
        const newIndex = (currentIndex - 1 + allPhotos.length) % allPhotos.length;
        setCurrentIndex(newIndex);
        setSelectedPhoto(allPhotos[newIndex].url);
    };

    const handleNext = () => {
        const newIndex = (currentIndex + 1) % allPhotos.length;
        setCurrentIndex(newIndex);
        setSelectedPhoto(allPhotos[newIndex].url);
    };

    return (
        <div className="space-y-6">
            <PhotosToolbar
                viewMode={viewMode}
                sortOrder={sortOrder}
                searchQuery={searchQuery}
                filterFolder={filterFolder}
                onSearchChange={setSearchQuery}
                onSortOrderChange={setSortOrder}
                onStartSlideshow={startSlideshow}
                onFilterFolderChange={setFilterFolder}
                onToggle={() => setViewMode(viewMode === 'time' ? 'all' : 'time')}
                folderItems={[{ key: 'all', label: 'Tất cả thư mục', value: null }]}
            />

            {!isLoading && (isError || driveFiles.length === 0) ? (
                <DataNotFound
                    loading={isLoading}
                    onRetry={() => login()}
                    message="Vui lòng kiểm tra kết nối hoặc thử lại sau."
                />
            ) : (
                <>
                    <PhotoGroups
                        columns={columns}
                        groupedPhotos={groupedPhotos}
                        onPhotoClick={handlePhotoClick}
                    />

                    <PaginationControls
                        currentPage={currentPage}
                        itemsPerPage={itemsPerPage}
                        totalItems={filteredAndSortedPhotos.length}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={setItemsPerPage}
                    />
                </>
            )}

            <SlideshowModal
                isOpen={isSlideshow}
                total={allPhotos.length}
                paused={slideshowPaused}
                currentIndex={currentIndex}
                selectedPhoto={selectedPhoto}
                slideshowInterval={slideshowInterval}
                onNext={handleNext}
                onPrevious={handlePrevious}
                stopSlideshow={stopSlideshow}
                onSetInterval={setSlideshowInterval}
                onTogglePause={toggleSlideshowPause}
            />

            <LightboxModal
                isOpen={isLightboxOpen}
                selectedPhoto={selectedPhoto}
                onOpenChange={(open) => (open ? undefined : closeLightbox())}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onRequestClose={closeLightbox}
            />
        </div>
    );
};

export default PhotosPage;
