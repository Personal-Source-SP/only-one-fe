'use client';

import LightboxModal from '@/components/module/photos/LightboxModal';
import PhotosNotFound from '@/components/module/photos/NotFound';
import PaginationControls from '@/components/module/photos/PaginationControls';
import PhotoGroups from '@/components/module/photos/PhotoGroups';
import SlideshowModal from '@/components/module/photos/SlideshowModal';
import PhotosToolbar from '@/components/module/photos/Toolbar';
import ViewModeToggle from '@/components/module/photos/ViewModeToggle';
import { useMainContext } from '@/contexts/MainContext';
import type { NGoogleDrive } from '@/interfaces';
import type { Photo } from '@/interfaces/photo';
import { useListFiles } from '@/query/google-drive.query';
import { usePhotosStore } from '@/stores/photos.store';
import { FC, useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

const PhotosPage: FC = () => {
    // ==== State ====
    const [columns, setColumns] = useState(4);
    const { googleToken } = useMainContext();

    const {
        viewMode,
        sortOrder,
        currentPage,
        isSlideshow,
        searchQuery,
        filterFolder,
        itemsPerPage,
        currentIndex,
        selectedPhoto,
        isLightboxOpen,
        slideshowPaused,
        slideshowInterval,
    } = usePhotosStore(
        useShallow((s) => ({
            viewMode: s.viewMode,
            sortOrder: s.sortOrder,
            currentPage: s.currentPage,
            isSlideshow: s.isSlideshow,
            searchQuery: s.searchQuery,
            filterFolder: s.filterFolder,
            itemsPerPage: s.itemsPerPage,
            currentIndex: s.currentIndex,
            selectedPhoto: s.selectedPhoto,
            isLightboxOpen: s.isLightboxOpen,
            slideshowPaused: s.slideshowPaused,
            slideshowInterval: s.slideshowInterval,
        })),
    );

    const setViewMode = usePhotosStore((s) => s.setViewMode);
    const setSortOrder = usePhotosStore((s) => s.setSortOrder);
    const setCurrentPage = usePhotosStore((s) => s.setCurrentPage);
    const startSlideshow = usePhotosStore((s) => s.startSlideshow);
    const stopSlideshow = usePhotosStore((s) => s.stopSlideshow);
    const setSearchQuery = usePhotosStore((s) => s.setSearchQuery);
    const setFilterFolder = usePhotosStore((s) => s.setFilterFolder);
    const setItemsPerPage = usePhotosStore((s) => s.setItemsPerPage);
    const setCurrentIndexInStore = usePhotosStore((s) => s.setCurrentIndex);
    const setSelectedPhotoInStore = usePhotosStore((s) => s.setSelectedPhoto);
    const toggleSlideshowPause = usePhotosStore((s) => s.toggleSlideshowPause);
    const setSlideshowInterval = usePhotosStore((s) => s.setSlideshowInterval);
    const openLightbox = usePhotosStore((s) => s.openLightbox);
    const closeLightbox = usePhotosStore((s) => s.closeLightbox);

    // ==== useEffect ====
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
    }, [itemsPerPage, setCurrentPage]);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSlideshow, slideshowPaused, slideshowInterval, currentIndex]);

    // ==== useMemo / Data ====
    const listFilesRequest = useMemo<NGoogleDrive.ListFilesRequest>(
        () => ({
            q: "mimeType contains 'image/' and trashed=false",
            pageSize: 200,
            fields: 'files(id,name,mimeType,thumbnailLink,webContentLink,createdTime),nextPageToken',
            orderBy: 'createdTime desc',
            spaces: 'drive',
        }),
        [],
    );

    const {
        data: filesResponse,
        isError,
        isLoading,
        refetch,
    } = useListFiles(listFilesRequest, {
        retry: false,
        enabled: !!googleToken,
        refetchOnWindowFocus: false,
    });

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

    // ==== Handlers ====
    const handlePhotoClick = (url: string) => {
        const index = allPhotos.findIndex((photo) => photo.url === url);
        openLightbox(url, index);
    };

    const handlePrevious = () => {
        const newIndex = (currentIndex - 1 + allPhotos.length) % allPhotos.length;
        setCurrentIndexInStore(newIndex);
        setSelectedPhotoInStore(allPhotos[newIndex].url);
    };

    const handleNext = () => {
        const newIndex = (currentIndex + 1) % allPhotos.length;
        setCurrentIndexInStore(newIndex);
        setSelectedPhotoInStore(allPhotos[newIndex].url);
    };

    if (!isLoading && (isError || driveFiles.length === 0)) {
        return <PhotosNotFound onRetry={() => refetch()} loading={isLoading} />;
    }

    return (
        <div className="space-y-6">
            <PhotosToolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filterFolder={filterFolder}
                onFilterFolderChange={setFilterFolder}
                sortOrder={sortOrder}
                onSortOrderChange={setSortOrder}
                folderItems={[{ key: 'all', label: 'Tất cả thư mục', value: null }]}
                onStartSlideshow={startSlideshow}
            />

            <ViewModeToggle
                viewMode={viewMode}
                onToggle={() => setViewMode(viewMode === 'time' ? 'all' : 'time')}
            />

            <PhotoGroups
                groupedPhotos={groupedPhotos}
                columns={columns}
                onPhotoClick={handlePhotoClick}
            />

            <PaginationControls
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                totalItems={filteredAndSortedPhotos.length}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
            />

            <SlideshowModal
                isOpen={isSlideshow}
                selectedPhoto={selectedPhoto}
                currentIndex={currentIndex}
                total={allPhotos.length}
                onPrevious={handlePrevious}
                onNext={handleNext}
                stopSlideshow={stopSlideshow}
                slideshowInterval={slideshowInterval}
                onSetInterval={setSlideshowInterval}
                paused={slideshowPaused}
                onTogglePause={toggleSlideshowPause}
            />

            <LightboxModal
                isOpen={isLightboxOpen}
                onOpenChange={(open) => (open ? undefined : closeLightbox())}
                selectedPhoto={selectedPhoto}
                onRequestClose={closeLightbox}
                onPrevious={handlePrevious}
                onNext={handleNext}
            />
        </div>
    );
};

export default PhotosPage;
