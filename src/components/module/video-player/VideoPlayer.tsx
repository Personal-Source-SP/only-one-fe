'use client';

import { formatTimeVideoPlayer } from '@/libs';
import { MouseEvent, useCallback, useEffect, useRef, useState } from 'react';

import { VideoCenterOverlay } from './VideoCenterOverlay';
import { VideoControlsBar } from './VideoControlsBar';

type VideoPlayerProps = {
    src: string;
    poster?: string;
    isActive: boolean;
};

export const VideoPlayer = ({ src, poster, isActive }: VideoPlayerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [volume, setVolume] = useState(1);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showControls, setShowControls] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [seekFeedback, setSeekFeedback] = useState<'forward' | 'backward' | null>(null);

    // Reset state when src changes
    useEffect(() => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
        setShowControls(true);
        if (videoRef.current) {
            videoRef.current.load();
            videoRef.current.playbackRate = playbackRate;
        }
    }, [src, playbackRate]);

    // Pause if slide becomes inactive
    useEffect(() => {
        if (!isActive && videoRef.current && !videoRef.current.paused) {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }, [isActive]);

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const togglePlay = useCallback(() => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
                setIsPlaying(true);
            } else {
                videoRef.current.pause();
                setIsPlaying(false);
            }
        }
    }, []);

    const skip = useCallback((seconds: number) => {
        if (videoRef.current) {
            let newTime = videoRef.current.currentTime + seconds;
            newTime = Math.max(0, Math.min(newTime, videoRef.current.duration));
            videoRef.current.currentTime = newTime;
            setSeekFeedback(seconds > 0 ? 'forward' : 'backward');
            setTimeout(() => setSeekFeedback(null), 800);
        }
    }, []);

    const handleTimeUpdate = useCallback(() => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            const dur = videoRef.current.duration;
            setCurrentTime(current);
            setDuration(dur);
            setProgress((current / dur) * 100);
        }
    }, []);

    const handleSeek = useCallback((value: number) => {
        if (videoRef.current) {
            const newTime = (value / 100) * videoRef.current.duration;
            videoRef.current.currentTime = newTime;
            setProgress(value);
        }
    }, []);

    const toggleMute = useCallback(() => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    }, [isMuted]);

    const handleVolumeChange = useCallback((value: number) => {
        setVolume(value);
        if (videoRef.current) {
            videoRef.current.volume = value;
            setIsMuted(value === 0);
        }
    }, []);

    const changePlaybackRate = useCallback((rate: number) => {
        setPlaybackRate(rate);
        if (videoRef.current) {
            videoRef.current.playbackRate = rate;
        }
        setIsSettingsOpen(false);
    }, []);

    const togglePiP = useCallback(async () => {
        if (videoRef.current) {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else {
                await videoRef.current.requestPictureInPicture();
            }
        }
    }, []);

    const toggleFullscreen = useCallback(async () => {
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
    }, []);

    const handleMouseMove = useCallback(() => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 3000);
    }, [isPlaying]);

    const handleDoubleClick = useCallback(
        (e: MouseEvent<HTMLDivElement>) => {
            if (!containerRef.current || !videoRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;

            if (x < width / 3) {
                skip(-10);
            } else if (x > (2 * width) / 3) {
                skip(10);
            }
        },
        [skip],
    );

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onDoubleClick={handleDoubleClick}
            onMouseLeave={() => isPlaying && setShowControls(false)}
            className="relative w-full h-full bg-black flex items-center justify-center group select-none overflow-hidden rounded-lg"
            onClick={(e) => {
                if ((e.target as HTMLElement).closest('.controls-bar')) return;
                togglePlay();
            }}
        >
            <video
                src={src}
                ref={videoRef}
                poster={poster}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                onClick={(e) => e.stopPropagation()}
                className="w-full h-full max-h-[85vh] object-contain"
            />

            <VideoCenterOverlay isPlaying={isPlaying} seekFeedback={seekFeedback} />

            <VideoControlsBar
                showControls={showControls}
                progress={progress}
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                volume={volume}
                isMuted={isMuted}
                playbackRate={playbackRate}
                isFullscreen={isFullscreen}
                isSettingsOpen={isSettingsOpen}
                formatTime={formatTimeVideoPlayer}
                onSeek={handleSeek}
                onTogglePlay={togglePlay}
                onSkip={skip}
                onToggleMute={toggleMute}
                onVolumeChange={handleVolumeChange}
                onChangePlaybackRate={changePlaybackRate}
                onSettingsOpenChange={setIsSettingsOpen}
                onTogglePiP={togglePiP}
                onToggleFullscreen={toggleFullscreen}
            />
        </div>
    );
};
