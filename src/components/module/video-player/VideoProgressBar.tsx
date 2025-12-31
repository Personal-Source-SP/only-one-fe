'use client';

import { Slider } from 'antd';

type VideoProgressBarProps = {
    progress: number;
    onSeek: (value: number) => void;
};

const VideoProgressBar = ({ progress, onSeek }: VideoProgressBarProps) => {
    return (
        <div className="relative w-full">
            <Slider
                value={progress}
                onChange={onSeek}
                tooltip={{ formatter: null }}
                className="video-progress-slider"
                styles={{
                    track: { background: 'rgba(255, 255, 255, 0.2)' },
                    rail: { background: 'rgba(255, 255, 255, 0.2)' },
                    handle: { display: 'none' },
                }}
            />
        </div>
    );
};

export default VideoProgressBar;
