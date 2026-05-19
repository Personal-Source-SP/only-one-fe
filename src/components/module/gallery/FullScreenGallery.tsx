'use client';

import {
    CustomButton,
    CustomDropdown,
    CustomFlex,
    CustomSpace,
    CustomTypography,
} from '@/components/custom';
import { GalleryViewMode, MediaType } from '@/enums';
import { MediaItem } from '@/interfaces';
import {
    AppstoreOutlined,
    BorderOutlined,
    ClockCircleOutlined,
    CloseOutlined,
    PauseOutlined,
    PictureOutlined,
    PlayCircleOutlined,
    VideoCameraOutlined,
} from '@ant-design/icons';
import { useEffect, useMemo, useRef, useState } from 'react';

import { GalleryGridView } from './GalleryGridView';
import { GallerySliderView } from './GallerySliderView';

type FullScreenGalleryProps = {
    isOpen: boolean;
    onClose: () => void;
    mediaItems: MediaItem[];
};

export const FullScreenGallery = ({ isOpen, onClose, mediaItems }: FullScreenGalleryProps) => {
    const settingsRef = useRef<HTMLDivElement>(null);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [filter, setFilter] = useState<MediaType>(MediaType.ALL);
    const [viewMode, setViewMode] = useState<GalleryViewMode>(GalleryViewMode.GRID);

    // Slideshow state
    const [isPlaying, setIsPlaying] = useState(false);
    const [slideInterval, setSlideInterval] = useState(3000);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const filteredItems = useMemo(() => {
        return mediaItems.filter((item) => {
            if (filter === MediaType.ALL) return true;
            return item.type === filter;
        });
    }, [mediaItems, filter]);

    // Reset index when filter changes
    useEffect(() => {
        setCurrentIndex(0);
        setIsPlaying(false);
    }, [filter]);

    // Reset state when opened
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            setIsPlaying(false); // Reset auto play
        }
    }, [isOpen]);

    // Autoplay Logic
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        const currentItem = filteredItems[currentIndex];
        const currentIsVideo = currentItem?.type === MediaType.VIDEO;

        if (
            isPlaying &&
            viewMode === GalleryViewMode.SLIDER &&
            isOpen &&
            !currentIsVideo &&
            filteredItems.length > 0
        ) {
            interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % filteredItems.length);
            }, slideInterval);
        }
        return () => clearInterval(interval);
    }, [
        isPlaying,
        viewMode,
        slideInterval,
        isOpen,
        filteredItems.length,
        currentIndex,
        filteredItems,
    ]);

    // Handle clicking outside settings
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
                setIsSettingsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'Escape') onClose();

            if (viewMode === GalleryViewMode.SLIDER && filteredItems.length > 0) {
                if (e.key === 'ArrowLeft') {
                    setCurrentIndex(
                        (prev) => (prev - 1 + filteredItems.length) % filteredItems.length,
                    );
                    setIsPlaying(false);
                }
                if (e.key === 'ArrowRight') {
                    setCurrentIndex((prev) => (prev + 1) % filteredItems.length);
                    setIsPlaying(false);
                }
                if (e.key === ' ') {
                    if (filteredItems[currentIndex]?.type !== MediaType.VIDEO) {
                        e.preventDefault();
                        setIsPlaying((p) => !p);
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, viewMode, filteredItems.length, currentIndex, filteredItems]);

    const switchToSlider = (index: number) => {
        setIsPlaying(false);
        setCurrentIndex(index);
        setViewMode(GalleryViewMode.SLIDER);
    };

    const getDisplayTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours < 24) {
            if (diffHours < 1) {
                const min = Math.floor(diffMs / (1000 * 60));
                return `${min} phút trước`;
            }
            return `${Math.floor(diffHours)} giờ trước`;
        }
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    if (!isOpen) return null;

    const currentItem = filteredItems[currentIndex];

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900 text-white flex flex-col animate-in fade-in duration-200">
            {/* --- Toolbar --- */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-3 sm:px-6 py-3 sm:py-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 z-10 gap-3 sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-start">
                    <div className="flex items-center gap-3">
                        <h2 className="text-base sm:text-lg font-bold tracking-tight truncate">
                            Thư viện Media
                        </h2>
                        <span className="text-slate-400 text-xs sm:text-sm border-l border-slate-600 pl-3 sm:pl-4">
                            {filteredItems.length} mục
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    {/* Filter Toggles */}
                    <CustomButton.Group className="bg-slate-800 p-1 rounded-lg border border-slate-700 mr-1 sm:mr-2">
                        <CustomButton
                            size="small"
                            onClick={() => setFilter(MediaType.ALL)}
                            type={filter === MediaType.ALL ? 'primary' : 'text'}
                            className={`px-2 sm:px-3 text-xs font-medium ${filter === MediaType.ALL ? 'bg-slate-700' : 'text-slate-400 hover:text-white'}`}
                        >
                            Tất cả
                        </CustomButton>
                        <CustomButton
                            size="small"
                            icon={<PictureOutlined />}
                            onClick={() => setFilter(MediaType.IMAGE)}
                            type={filter === MediaType.IMAGE ? 'primary' : 'text'}
                            className={`px-2 sm:px-3 text-xs font-medium flex items-center gap-1.5 ${filter === MediaType.IMAGE ? 'bg-indigo-600' : 'text-slate-400 hover:text-white'}`}
                        >
                            <span className="hidden sm:inline">Ảnh</span>
                        </CustomButton>
                        <CustomButton
                            size="small"
                            icon={<VideoCameraOutlined />}
                            onClick={() => setFilter(MediaType.VIDEO)}
                            type={filter === MediaType.VIDEO ? 'primary' : 'text'}
                            className={`px-2 sm:px-3 text-xs font-medium flex items-center gap-1.5 ${filter === 'video' ? 'bg-rose-600' : 'text-slate-400 hover:text-white'}`}
                        >
                            <span className="hidden sm:inline">Video</span>
                        </CustomButton>
                    </CustomButton.Group>

                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Slideshow Controls */}
                        {viewMode === GalleryViewMode.SLIDER &&
                            currentItem?.type !== MediaType.VIDEO &&
                            filteredItems.length > 0 && (
                                <CustomSpace.Compact className="bg-slate-800/50 rounded-lg p-1 border border-slate-700">
                                    <CustomButton
                                        type={isPlaying ? 'primary' : 'text'}
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        title={isPlaying ? 'Tạm dừng' : 'Phát tự động'}
                                        icon={
                                            isPlaying ? <PauseOutlined /> : <PlayCircleOutlined />
                                        }
                                        className={`p-1.5 sm:p-2 ${
                                            isPlaying
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                                : 'hover:bg-slate-700 text-slate-300'
                                        }`}
                                    />

                                    <CustomDropdown
                                        open={isSettingsOpen}
                                        placement="bottomRight"
                                        onOpenChange={setIsSettingsOpen}
                                        dropdownRender={() => (
                                            <div
                                                ref={settingsRef}
                                                className="w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-3 z-50"
                                            >
                                                <CustomTypography.Text className="text-xs font-semibold text-slate-400 uppercase mb-2 px-2 block">
                                                    Thời gian chuyển
                                                </CustomTypography.Text>
                                                <CustomSpace
                                                    size="small"
                                                    className="w-full"
                                                    direction="vertical"
                                                >
                                                    {[2000, 3000, 5000, 10000].map((time) => (
                                                        <CustomButton
                                                            block
                                                            key={time}
                                                            type={
                                                                slideInterval === time
                                                                    ? 'primary'
                                                                    : 'text'
                                                            }
                                                            onClick={() => {
                                                                setSlideInterval(time);
                                                                setIsSettingsOpen(false);

                                                                if (!isPlaying) setIsPlaying(true);
                                                            }}
                                                            className={`text-left ${
                                                                slideInterval === time
                                                                    ? 'bg-indigo-600 text-white'
                                                                    : 'hover:bg-slate-700 text-slate-300'
                                                            }`}
                                                        >
                                                            <CustomFlex
                                                                align="center"
                                                                justify="space-between"
                                                            >
                                                                <span>{time / 1000} giây</span>
                                                                {slideInterval === time && (
                                                                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                                                )}
                                                            </CustomFlex>
                                                        </CustomButton>
                                                    ))}
                                                </CustomSpace>
                                            </div>
                                        )}
                                    >
                                        <CustomButton
                                            type={isSettingsOpen ? 'primary' : 'text'}
                                            icon={<ClockCircleOutlined />}
                                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                            className={`p-1.5 sm:p-2 ${
                                                isSettingsOpen
                                                    ? 'bg-slate-700 text-white'
                                                    : 'hover:bg-slate-700 text-slate-300'
                                            }`}
                                            title="Thời gian chuyển slide"
                                        />
                                    </CustomDropdown>
                                </CustomSpace.Compact>
                            )}

                        {/* View Mode Toggles */}
                        <CustomButton.Group className="bg-slate-800 p-1 rounded-lg border border-slate-700">
                            <CustomButton
                                title="Lưới"
                                icon={<AppstoreOutlined />}
                                type={viewMode === GalleryViewMode.GRID ? 'primary' : 'text'}
                                className={`p-1.5 sm:p-2 ${viewMode === GalleryViewMode.GRID ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                onClick={() => {
                                    setIsPlaying(false);
                                    setViewMode(GalleryViewMode.GRID);
                                }}
                            />
                            <CustomButton
                                title="Trình chiếu"
                                icon={<BorderOutlined />}
                                onClick={() => setViewMode(GalleryViewMode.SLIDER)}
                                type={viewMode === GalleryViewMode.SLIDER ? 'primary' : 'text'}
                                className={`p-1.5 sm:p-2 ${viewMode === 'slider' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                            />
                        </CustomButton.Group>

                        <div className="w-px h-6 sm:h-8 bg-slate-700 mx-1 sm:mx-2" />

                        <CustomButton
                            type="text"
                            onClick={onClose}
                            icon={<CloseOutlined />}
                            className="p-1.5 sm:p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-rose-500"
                        />
                    </div>
                </div>
            </div>

            {/* --- Main Content --- */}
            <div className="flex-1 overflow-hidden relative bg-slate-950">
                {viewMode === GalleryViewMode.GRID ? (
                    <GalleryGridView
                        items={filteredItems}
                        onItemClick={switchToSlider}
                        getDisplayTime={getDisplayTime}
                    />
                ) : (
                    <GallerySliderView
                        items={filteredItems}
                        isPlaying={isPlaying}
                        currentIndex={currentIndex}
                        slideInterval={slideInterval}
                        getDisplayTime={getDisplayTime}
                        onClearFilter={() => setFilter(MediaType.ALL)}
                        isOpen={isOpen && viewMode === GalleryViewMode.SLIDER}
                        onNext={() => {
                            setCurrentIndex((prev) => (prev + 1) % filteredItems.length);
                            setIsPlaying(false);
                        }}
                        onPrev={() => {
                            setCurrentIndex(
                                (prev) => (prev - 1 + filteredItems.length) % filteredItems.length,
                            );
                            setIsPlaying(false);
                        }}
                        onSelectIndex={(idx: number) => {
                            setCurrentIndex(idx);
                            setIsPlaying(false);
                        }}
                    />
                )}
            </div>
        </div>
    );
};
