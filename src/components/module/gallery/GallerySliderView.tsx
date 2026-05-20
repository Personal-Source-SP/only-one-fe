'use client';

import { CustomButton, CustomEmpty, CustomFlex, CustomSpace } from '@/components/custom';
import { VideoPlayer } from '@/components/module/video-player';
import {
    ClockCircleOutlined,
    CompressOutlined,
    DownloadOutlined,
    ExpandOutlined,
    FilterOutlined,
    LeftOutlined,
    PictureOutlined,
    PlayCircleOutlined,
    RightOutlined,
} from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';

interface MediaItem {
    id: string;
    url: string;
    thumbnail?: string;
    title: string;
    type: 'image' | 'video' | string;
    createdAt: string;
}

type GallerySliderViewProps = {
    items: MediaItem[];
    currentIndex: number;
    isPlaying: boolean;
    slideInterval: number;
    isOpen: boolean;
    onNext: () => void;
    onPrev: () => void;
    onSelectIndex: (index: number) => void;
    onClearFilter: () => void;
    getDisplayTime: (date: string) => string;
};

export const GallerySliderView = ({
    items,
    currentIndex,
    isPlaying,
    slideInterval,
    isOpen,
    onNext,
    onPrev,
    onSelectIndex,
    onClearFilter,
    getDisplayTime,
}: GallerySliderViewProps) => {
    const currentItem = items[currentIndex];
    const containerRef = useRef<HTMLDivElement>(null);

    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = async () => {
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            try {
                await containerRef.current.requestFullscreen();
            } catch (err) {
                console.error('Error attempting to enable fullscreen:', err);
            }
        } else {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            }
        }
    };

    if (!items?.length) {
        return (
            <CustomFlex vertical align="center" justify="center" className="flex-1">
                <CustomEmpty
                    image={<FilterOutlined className="text-5xl text-slate-500 opacity-50" />}
                    description={
                        <div className="flex flex-col items-center gap-2">
                            <p className="text-slate-500">
                                Không có media nào trong danh sách lọc.
                            </p>
                            <CustomButton
                                type="link"
                                onClick={onClearFilter}
                                className="text-hub-primary"
                            >
                                Xem tất cả
                            </CustomButton>
                        </div>
                    }
                />
            </CustomFlex>
        );
    }

    return (
        <div
            ref={containerRef}
            className="h-full flex flex-col relative animate-in zoom-in-95 duration-200 bg-slate-950"
        >
            {/* Main Content Container */}
            <div className="flex-1 flex items-center justify-center p-2 sm:p-4 md:p-10 relative group bg-black/50 overflow-hidden">
                {/* Previous CustomButton - Always visible on mobile, hover on desktop */}
                <CustomButton
                    type="text"
                    onClick={onPrev}
                    icon={<LeftOutlined />}
                    className="absolute left-2 sm:left-4 md:left-8 p-2 sm:p-3 bg-black/20 hover:bg-hub-primary/80 backdrop-blur-sm rounded-full text-white transition-all transform hover:scale-110 z-20 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 border-none h-auto"
                    style={{ width: 'auto', height: 'auto' }}
                />

                {/* Main Media Item */}
                <div className="relative w-full h-full max-h-full flex items-center justify-center">
                    {currentItem?.type === 'video' ? (
                        <div className="w-full max-w-5xl h-full max-h-[85vh] aspect-video">
                            <VideoPlayer
                                isActive={isOpen}
                                src={currentItem.url}
                                poster={currentItem.thumbnail}
                            />
                        </div>
                    ) : (
                        currentItem && (
                            <img
                                src={currentItem.url}
                                alt={currentItem.title}
                                className="max-h-[70vh] sm:max-h-[80vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
                            />
                        )
                    )}
                </div>

                {/* Next CustomButton - Always visible on mobile, hover on desktop */}
                <CustomButton
                    type="text"
                    onClick={onNext}
                    icon={<RightOutlined />}
                    style={{ width: 'auto', height: 'auto' }}
                    className="absolute right-2 sm:right-4 md:right-8 p-2 sm:p-3 bg-black/20 hover:bg-hub-primary/80 backdrop-blur-sm rounded-full text-white transition-all transform hover:scale-110 z-20 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 border-none h-auto"
                />

                {/* Image Info Overlay - Only show for Images, Video has its own controls */}
                {currentItem && currentItem.type !== 'video' && (
                    <div
                        className={`absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-full flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-4 transition-opacity duration-300 w-[90%] sm:w-auto max-w-full ${isPlaying ? 'opacity-30 hover:opacity-100' : 'opacity-100 sm:opacity-0 sm:group-hover:opacity-100'}`}
                    >
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300 sm:border-r border-white/20 pr-0 sm:pr-4 w-full sm:w-auto">
                            <PictureOutlined className="text-hub-primary flex-shrink-0 text-sm" />
                            <span className="truncate">
                                {getDisplayTime(currentItem.createdAt)}
                            </span>
                        </div>

                        <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                            <span className="font-medium text-xs sm:text-base truncate max-w-[150px] sm:max-w-xs">
                                {currentItem.title}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-slate-400 text-xs sm:text-sm">|</span>
                                <span className="text-slate-400 text-xs sm:text-sm whitespace-nowrap">
                                    {currentIndex + 1} / {items.length}
                                </span>
                            </div>
                        </div>

                        <div className="hidden sm:flex items-center">
                            {isPlaying && (
                                <span className="flex items-center gap-1 text-xs text-hub-primary border-l border-white/20 pl-3">
                                    <ClockCircleOutlined className="text-xs" />{' '}
                                    {slideInterval / 1000}s
                                </span>
                            )}

                            <CustomButton
                                type="text"
                                icon={<DownloadOutlined />}
                                className="text-slate-300 hover:text-white ml-2 p-1 border-none"
                                title="Tải xuống"
                                style={{ width: 'auto', height: 'auto' }}
                            />

                            <CustomButton
                                type="text"
                                onClick={toggleFullscreen}
                                style={{ width: 'auto', height: 'auto' }}
                                title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
                                className="text-slate-300 hover:text-white ml-1 p-1 border-none"
                                icon={isFullscreen ? <CompressOutlined /> : <ExpandOutlined />}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Thumbnails Strip */}
            <div className="h-20 sm:h-24 bg-slate-900 border-t border-slate-800 flex items-center gap-2 px-2 sm:px-4 overflow-x-auto custom-scrollbar z-20">
                <CustomSpace size="small" className="w-full">
                    {items.map((item, idx) => (
                        <CustomButton
                            type="text"
                            key={item.id}
                            onClick={() => onSelectIndex(idx)}
                            style={{ width: '56px', height: '56px', padding: 0 }}
                            className={`relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all p-0 ${
                                idx === currentIndex
                                    ? 'border-hub-primary opacity-100 ring-2 ring-hub-primary/30'
                                    : 'border-transparent opacity-50 hover:opacity-80'
                            }`}
                        >
                            <img
                                alt=""
                                className="w-full h-full object-cover"
                                src={item.type === 'video' ? item.thumbnail || item.url : item.url}
                            />
                            {item.type === 'video' && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                    <PlayCircleOutlined className="text-lg sm:text-xl text-white/80" />
                                </div>
                            )}
                        </CustomButton>
                    ))}
                </CustomSpace>
            </div>
        </div>
    );
};
