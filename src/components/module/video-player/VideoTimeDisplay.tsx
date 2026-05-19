'use client';

type VideoTimeDisplayProps = {
    currentTime: number;
    duration: number;
    formatTime: (time: number) => string;
};

export const VideoTimeDisplay = ({ currentTime, duration, formatTime }: VideoTimeDisplayProps) => {
    return (
        <CustomTypography.Text className="text-[10px] sm:text-xs text-slate-300 font-medium font-mono flex items-center ml-2">
            {formatTime(currentTime)}
            <span className="mx-1 text-slate-500">/</span>
            {formatTime(duration)}
            {duration > 0 && (
                <span className="ml-2 text-slate-400 hidden sm:inline-block">
                    (-{formatTime(Math.max(0, duration - currentTime))})
                </span>
            )}
        </CustomTypography.Text>
    );
};
import { CustomTypography } from '@/components/custom';
