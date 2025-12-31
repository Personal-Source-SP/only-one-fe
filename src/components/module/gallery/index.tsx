'use client';

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
import { Button, Dropdown, Flex, Space, Typography } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';

import GalleryGridView from './GalleryGridView';
import GallerySliderView from './GallerySliderView';

interface MediaItem {
    id: string;
    url: string;
    thumbnail?: string;
    title: string;
    type: 'image' | 'video' | string;
    createdAt: string;
}

type FullScreenGalleryProps = {
    isOpen: boolean;
    onClose: () => void;
    mediaItems: MediaItem[];
};

const FullScreenGallery = ({ isOpen, onClose, mediaItems }: FullScreenGalleryProps) => {
    const [viewMode, setViewMode] = useState<'grid' | 'slider'>('grid');
    const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
    const [currentIndex, setCurrentIndex] = useState(0);

    // Slideshow state
    const [isPlaying, setIsPlaying] = useState(false);
    const [slideInterval, setSlideInterval] = useState(3000);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const settingsRef = useRef<HTMLDivElement>(null);

    const filteredItems = useMemo(() => {
        return mediaItems.filter((item) => {
            if (filter === 'all') return true;
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
        const currentIsVideo = currentItem?.type === 'video';

        if (
            isPlaying &&
            viewMode === 'slider' &&
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

            if (viewMode === 'slider' && filteredItems.length > 0) {
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
                    if (filteredItems[currentIndex]?.type !== 'video') {
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
        setCurrentIndex(index);
        setViewMode('slider');
        setIsPlaying(false);
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
                    <Button.Group className="bg-slate-800 p-1 rounded-lg border border-slate-700 mr-1 sm:mr-2">
                        <Button
                            type={filter === 'all' ? 'primary' : 'text'}
                            size="small"
                            onClick={() => setFilter('all')}
                            className={`px-2 sm:px-3 text-xs font-medium ${filter === 'all' ? 'bg-slate-700' : 'text-slate-400 hover:text-white'}`}
                        >
                            Tất cả
                        </Button>
                        <Button
                            type={filter === 'image' ? 'primary' : 'text'}
                            size="small"
                            icon={<PictureOutlined />}
                            onClick={() => setFilter('image')}
                            className={`px-2 sm:px-3 text-xs font-medium flex items-center gap-1.5 ${filter === 'image' ? 'bg-indigo-600' : 'text-slate-400 hover:text-white'}`}
                        >
                            <span className="hidden sm:inline">Ảnh</span>
                        </Button>
                        <Button
                            type={filter === 'video' ? 'primary' : 'text'}
                            size="small"
                            icon={<VideoCameraOutlined />}
                            onClick={() => setFilter('video')}
                            className={`px-2 sm:px-3 text-xs font-medium flex items-center gap-1.5 ${filter === 'video' ? 'bg-rose-600' : 'text-slate-400 hover:text-white'}`}
                        >
                            <span className="hidden sm:inline">Video</span>
                        </Button>
                    </Button.Group>

                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Slideshow Controls */}
                        {viewMode === 'slider' &&
                            currentItem?.type !== 'video' &&
                            filteredItems.length > 0 && (
                                <Space.Compact className="bg-slate-800/50 rounded-lg p-1 border border-slate-700">
                                    <Button
                                        type={isPlaying ? 'primary' : 'text'}
                                        icon={
                                            isPlaying ? <PauseOutlined /> : <PlayCircleOutlined />
                                        }
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        className={`p-1.5 sm:p-2 ${
                                            isPlaying
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                                : 'hover:bg-slate-700 text-slate-300'
                                        }`}
                                        title={isPlaying ? 'Tạm dừng' : 'Phát tự động'}
                                    />

                                    <Dropdown
                                        open={isSettingsOpen}
                                        onOpenChange={setIsSettingsOpen}
                                        placement="bottomRight"
                                        dropdownRender={() => (
                                            <div
                                                ref={settingsRef}
                                                className="w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-3 z-50"
                                            >
                                                <Typography.Text className="text-xs font-semibold text-slate-400 uppercase mb-2 px-2 block">
                                                    Thời gian chuyển
                                                </Typography.Text>
                                                <Space
                                                    direction="vertical"
                                                    size="small"
                                                    className="w-full"
                                                >
                                                    {[2000, 3000, 5000, 10000].map((time) => (
                                                        <Button
                                                            key={time}
                                                            type={
                                                                slideInterval === time
                                                                    ? 'primary'
                                                                    : 'text'
                                                            }
                                                            block
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
                                                            <Flex
                                                                justify="space-between"
                                                                align="center"
                                                            >
                                                                <span>{time / 1000} giây</span>
                                                                {slideInterval === time && (
                                                                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                                                )}
                                                            </Flex>
                                                        </Button>
                                                    ))}
                                                </Space>
                                            </div>
                                        )}
                                    >
                                        <Button
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
                                    </Dropdown>
                                </Space.Compact>
                            )}

                        {/* View Mode Toggles */}
                        <Button.Group className="bg-slate-800 p-1 rounded-lg border border-slate-700">
                            <Button
                                type={viewMode === 'grid' ? 'primary' : 'text'}
                                icon={<AppstoreOutlined />}
                                onClick={() => {
                                    setViewMode('grid');
                                    setIsPlaying(false);
                                }}
                                className={`p-1.5 sm:p-2 ${viewMode === 'grid' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                title="Lưới"
                            />
                            <Button
                                type={viewMode === 'slider' ? 'primary' : 'text'}
                                icon={<BorderOutlined />}
                                onClick={() => setViewMode('slider')}
                                className={`p-1.5 sm:p-2 ${viewMode === 'slider' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                title="Trình chiếu"
                            />
                        </Button.Group>

                        <div className="w-px h-6 sm:h-8 bg-slate-700 mx-1 sm:mx-2" />

                        <Button
                            type="text"
                            icon={<CloseOutlined />}
                            onClick={onClose}
                            className="p-1.5 sm:p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-rose-500"
                        />
                    </div>
                </div>
            </div>

            {/* --- Main Content --- */}
            <div className="flex-1 overflow-hidden relative bg-slate-950">
                {viewMode === 'grid' ? (
                    <GalleryGridView
                        items={filteredItems}
                        onItemClick={switchToSlider}
                        getDisplayTime={getDisplayTime}
                    />
                ) : (
                    <GallerySliderView
                        items={filteredItems}
                        currentIndex={currentIndex}
                        isPlaying={isPlaying}
                        slideInterval={slideInterval}
                        isOpen={isOpen && viewMode === 'slider'}
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
                        onClearFilter={() => setFilter('all')}
                        getDisplayTime={getDisplayTime}
                    />
                )}
            </div>
        </div>
    );
};

export default FullScreenGallery;
