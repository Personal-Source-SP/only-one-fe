'use client';

import { CompressOutlined, ExpandOutlined } from '@ant-design/icons';
import { Icon } from '@iconify/react';
import { Button, Flex, Space } from 'antd';
import VideoPlaybackControls from './VideoPlaybackControls';
import VideoPlaybackSpeedMenu from './VideoPlaybackSpeedMenu';
import VideoProgressBar from './VideoProgressBar';
import VideoTimeDisplay from './VideoTimeDisplay';
import VideoVolumeControl from './VideoVolumeControl';

type VideoControlsBarProps = {
    showControls: boolean;
    progress: number;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    isMuted: boolean;
    playbackRate: number;
    isFullscreen: boolean;
    isSettingsOpen: boolean;
    formatTime: (time: number) => string;
    onSeek: (value: number) => void;
    onTogglePlay: () => void;
    onSkip: (seconds: number) => void;
    onToggleMute: () => void;
    onVolumeChange: (value: number) => void;
    onChangePlaybackRate: (rate: number) => void;
    onSettingsOpenChange: (open: boolean) => void;
    onTogglePiP: () => void;
    onToggleFullscreen: () => void;
};

const VideoControlsBar = ({
    showControls,
    progress,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    isFullscreen,
    isSettingsOpen,
    formatTime,
    onSeek,
    onTogglePlay,
    onSkip,
    onToggleMute,
    onVolumeChange,
    onChangePlaybackRate,
    onSettingsOpenChange,
    onTogglePiP,
    onToggleFullscreen,
}: VideoControlsBarProps) => {
    return (
        <div
            onClick={(e) => e.stopPropagation()}
            className={`controls-bar absolute bottom-0 left-0 right-0 px-3 sm:px-4 pt-12 pb-2 sm:pb-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300 flex flex-col gap-2 ${showControls ? 'opacity-100' : 'opacity-0'}`}
        >
            <VideoProgressBar progress={progress} onSeek={onSeek} />

            <Flex justify="space-between" align="center" className="mt-2">
                <Space size="small" className="gap-2 sm:gap-4">
                    <VideoPlaybackControls
                        isPlaying={isPlaying}
                        onSkip={onSkip}
                        onTogglePlay={onTogglePlay}
                    />

                    <VideoVolumeControl
                        volume={volume}
                        isMuted={isMuted}
                        onToggleMute={onToggleMute}
                        onVolumeChange={onVolumeChange}
                    />

                    <VideoTimeDisplay
                        duration={duration}
                        currentTime={currentTime}
                        formatTime={formatTime}
                    />
                </Space>

                <Space size="small" className="gap-3">
                    <VideoPlaybackSpeedMenu
                        playbackRate={playbackRate}
                        isSettingsOpen={isSettingsOpen}
                        onOpenChange={onSettingsOpenChange}
                        onChangePlaybackRate={onChangePlaybackRate}
                    />

                    <Button
                        type="text"
                        onClick={onTogglePiP}
                        title="Picture in Picture"
                        style={{ width: 'auto', height: 'auto' }}
                        className="text-white hover:text-indigo-400 border-none"
                        icon={<Icon icon="lucide:picture-in-picture" className="text-lg" />}
                    />

                    <Button
                        type="text"
                        title="Toàn màn hình"
                        onClick={onToggleFullscreen}
                        style={{ width: 'auto', height: 'auto' }}
                        className="text-white hover:text-indigo-400 border-none"
                        icon={isFullscreen ? <CompressOutlined /> : <ExpandOutlined />}
                    />
                </Space>
            </Flex>
        </div>
    );
};

export default VideoControlsBar;
