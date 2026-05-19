'use client';

type VideoProgressBarProps = {
    progress: number;
    onSeek: (value: number) => void;
};

export const VideoProgressBar = ({ progress, onSeek }: VideoProgressBarProps) => {
    return (
        <div className="relative w-full">
            <CustomSlider
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
import { CustomSlider } from '@/components/custom';
