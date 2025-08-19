'use client';

import { useDisclosure } from '@heroui/react';
import { FC, useEffect, useMemo, useState } from 'react';
import PhotosToolbar from '@/components/module/photos/Toolbar';
import ViewModeToggle from '@/components/module/photos/ViewModeToggle';
import PhotoGroups from '@/components/module/photos/PhotoGroups';
import PaginationControls from '@/components/module/photos/PaginationControls';
import SlideshowModal from '@/components/module/photos/SlideshowModal';
import LightboxModal from '@/components/module/photos/LightboxModal';
import type { Photo } from '@/interfaces/photo';

type FilterOption = { id: string; name: string; preview: string | null };

const PhotosPage: FC = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Responsive grid columns
    const [columns, setColumns] = useState(4);

    useEffect(() => {
        const updateColumns = () => {
            const width = window.innerWidth;
            if (width < 640) {
                setColumns(2); // Mobile: 2 columns
            } else if (width < 1024) {
                setColumns(3); // Tablet: 3 columns
            } else {
                setColumns(4); // Desktop: 4+ columns
            }
        };

        window.addEventListener('resize', updateColumns);
        updateColumns(); // Initial check

        return () => window.removeEventListener('resize', updateColumns);
    }, []);

    // Updated mock data with date property
    const photoGroups: { date: string; photos: Photo[] }[] = [
        {
            date: 'Hôm nay',
            photos: [
                {
                    id: 1,
                    url: 'https://img.heroui.chat/image/landscape?w=600&h=400&u=1',
                    date: new Date(),
                },
                {
                    id: 2,
                    url: 'https://img.heroui.chat/image/landscape?w=600&h=400&u=2',
                    date: new Date(),
                },
                {
                    id: 3,
                    url: 'https://img.heroui.chat/image/landscape?w=600&h=400&u=3',
                    date: new Date(),
                },
                {
                    id: 4,
                    url: 'https://img.heroui.chat/image/landscape?w=600&h=400&u=4',
                    date: new Date(),
                },
            ],
        },
        {
            date: 'Tuần trước',
            photos: [
                {
                    id: 5,
                    url: 'https://img.heroui.chat/image/landscape?w=600&h=400&u=5',
                    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
                {
                    id: 6,
                    url: 'https://img.heroui.chat/image/landscape?w=600&h=400&u=6',
                    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
                {
                    id: 7,
                    url: 'https://img.heroui.chat/image/landscape?w=600&h=400&u=7',
                    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
                {
                    id: 8,
                    url: 'https://img.heroui.chat/image/landscape?w=600&h=400&u=8',
                    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
                {
                    id: 9,
                    url: 'https://img.heroui.chat/image/landscape?w=600&h=400&u=9',
                    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
                {
                    id: 10,
                    url: 'https://img.heroui.chat/image/landscape?w=600&h=400&u=10',
                    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
            ],
        },
        {
            date: 'Tháng trước',
            photos: [
                {
                    id: 11,
                    url: 'https://img.heroui.chat/image/landscape?w=600&h=400&u=11',
                    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
                {
                    id: 12,
                    url: 'https://img.heroui.chat/image/landscape?w=600&h=400&u=12',
                    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
                {
                    id: 13,
                    url: 'https://img.heroui.chat/image/landscape?w=600&h=400&u=13',
                    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
                {
                    id: 14,
                    url: 'https://img.heroui.chat/image/landscape?w=600&h=400&u=14',
                    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
                {
                    id: 15,
                    url: 'https://img.heroui.chat/image/landscape?w=600&h=400&u=15',
                    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
                {
                    id: 16,
                    url: 'https://img.heroui.chat/image/landscape?w=600&h=400&u=16',
                    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
                {
                    id: 17,
                    url: 'https://img.heroui.chat/image/landscape?w=600&h=400&u=17',
                    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
                {
                    id: 18,
                    url: 'https://img.heroui.chat/image/landscape?w=600&h=400&u=18',
                    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
            ],
        },
    ];

    // Flatten photos for navigation in lightbox
    const allPhotos = photoGroups.flatMap((group) => group.photos);

    // New state variables for enhanced features
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [filterFolder, setFilterFolder] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<'time' | 'all'>('time');

    // Mock folders for filtering
    const folders = ['Gia đình', 'Du lịch', 'Công việc', 'Sự kiện'];
    const folderItems = useMemo(
        () => [
            { key: 'all', label: 'Tất cả thư mục', value: null as string | null },
            ...folders.map((folder) => ({ key: folder, label: folder, value: folder })),
        ],
        [folders],
    );

    // New state variables for slideshow
    const [isSlideshow, setIsSlideshow] = useState(false);
    const [slideshowInterval, setSlideshowInterval] = useState(5);
    const [slideshowPaused, setSlideshowPaused] = useState(false);

    // New state variable for items per page
    const [itemsPerPage, setItemsPerPage] = useState(12);

    // Filter and sort photos
    const filteredAndSortedPhotos = useMemo(() => {
        let result = allPhotos;

        if (filterFolder) {
            result = result.filter((photo) => photo.folder === filterFolder);
        }

        if (searchQuery) {
            result = result.filter((photo) =>
                photo.id.toString().includes(searchQuery.toLowerCase()),
            );
        }

        result.sort((a, b) => {
            if (sortOrder === 'newest') {
                return b.date.getTime() - a.date.getTime();
            } else {
                return a.date.getTime() - b.date.getTime();
            }
        });

        return result;
    }, [allPhotos, filterFolder, searchQuery, sortOrder]);

    const startSlideshow = () => {
        setIsSlideshow(true);
        setSlideshowPaused(false);
        onOpen();
    };

    const stopSlideshow = () => {
        setIsSlideshow(false);
        setSlideshowPaused(false);
    };

    const toggleSlideshowPause = () => {
        setSlideshowPaused(!slideshowPaused);
    };

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

    useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage]);

    const paginatedPhotos = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedPhotos.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredAndSortedPhotos, currentPage, itemsPerPage]);

    const groupedPhotos = useMemo(() => {
        if (viewMode === 'all') {
            return [{ date: 'Tất cả ảnh', photos: paginatedPhotos }];
        }

        const groups: { [key: string]: typeof paginatedPhotos } = {};
        paginatedPhotos.forEach((photo) => {
            const dateKey = photo.date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(photo);
        });
        return Object.entries(groups).map(([date, photos]) => ({ date, photos }));
    }, [paginatedPhotos, viewMode]);

    const handlePhotoClick = (url: string) => {
        setSelectedPhoto(url);
        const index = allPhotos.findIndex((photo) => photo.url === url);
        setCurrentIndex(index);
        onOpen();
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
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filterFolder={filterFolder}
                onFilterFolderChange={setFilterFolder}
                sortOrder={sortOrder}
                onSortOrderChange={setSortOrder}
                folderItems={folderItems}
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
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                selectedPhoto={selectedPhoto}
                onRequestClose={() => onOpenChange()}
                onPrevious={handlePrevious}
                onNext={handleNext}
            />
        </div>
    );
};

export default PhotosPage;
