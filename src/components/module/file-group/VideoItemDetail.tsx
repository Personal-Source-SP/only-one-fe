'use client';

import { PlayCircleOutlined } from '@ant-design/icons';
import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';

type VideoItemDetailProps = {
    fileId: string;
    videoUrl: string;
    videoThumbnailUrl: string;
    setLoadingFiles: Dispatch<SetStateAction<Set<string>>>;
};

const VideoItemDetail = ({
    fileId,
    videoUrl,
    videoThumbnailUrl,
    setLoadingFiles,
}: VideoItemDetailProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    const [isReady, setIsReady] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        setLoadingFiles((prev) => new Set(prev).add(fileId));
    }, [fileId, setLoadingFiles]);

    const handleClick = useCallback(() => {
        if (!videoRef.current) return;

        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
        } else {
            videoRef.current.play();
            setIsPlaying(true);
        }
    }, [isPlaying]);

    const handleCanPlay = useCallback(() => {
        setIsReady(true);
        setLoadingFiles((prev) => {
            const newSet = new Set(prev);
            newSet.delete(fileId);
            return newSet;
        });
    }, [fileId, setLoadingFiles]);

    const handleError = useCallback(() => {
        setHasError(true);
        setIsReady(false);
        setLoadingFiles((prev) => {
            const newSet = new Set(prev);
            newSet.delete(fileId);
            return newSet;
        });
    }, [fileId, setLoadingFiles]);

    const handlePause = useCallback(() => {
        setIsPlaying(false);
    }, []);

    const handlePlay = useCallback(() => {
        setIsPlaying(true);
    }, []);

    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);

        if (videoRef.current && !isPlaying) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(() => {});
        }
    }, [isPlaying]);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);

        if (videoRef.current && isPlaying && !videoRef.current.paused) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    }, [isPlaying]);

    if (hasError) {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 z-10">
                <div className="text-center text-gray-500">
                    <PlayCircleOutlined className="text-4xl mb-2" />
                    <p className="text-sm">Không thể tải video</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="absolute inset-0 z-10 group/video overflow-hidden"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        >
            <video
                loop
                muted
                playsInline
                preload="metadata"
                ref={videoRef}
                src={videoUrl}
                poster={videoThumbnailUrl}
                onPlay={handlePlay}
                onError={handleError}
                onPause={handlePause}
                onCanPlay={handleCanPlay}
                style={{ opacity: isPlaying ? 1 : isHovered ? 0.85 : 1 }}
                className="w-full h-full object-cover transition-opacity duration-300"
            />

            {!isPlaying && (
                <div
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-300 cursor-pointer ${
                        isHovered ? 'opacity-100' : 'opacity-80'
                    }`}
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-black/40 rounded-full blur-2xl animate-pulse scale-150" />
                        <PlayCircleOutlined className="relative text-6xl text-white drop-shadow-2xl transition-transform duration-300 hover:scale-110" />
                    </div>
                </div>
            )}

            {isPlaying && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            )}

            {!isReady && !hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100/95 z-20 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-gray-600 font-medium">Đang tải video...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoItemDetail;
