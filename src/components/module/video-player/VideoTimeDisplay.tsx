'use client';

import { Typography } from 'antd';

type VideoTimeDisplayProps = {
    currentTime: number;
    duration: number;
    formatTime: (time: number) => string;
};

const VideoTimeDisplay = ({ currentTime, duration, formatTime }: VideoTimeDisplayProps) => {
    return (
        <Typography.Text className="text-[10px] sm:text-xs text-slate-300 font-medium font-mono flex items-center ml-2">
            {formatTime(currentTime)}
            <span className="mx-1 text-slate-500">/</span>
            {formatTime(duration)}
            {duration > 0 && (
                <span className="ml-2 text-slate-400 hidden sm:inline-block">
                    (-{formatTime(Math.max(0, duration - currentTime))})
                </span>
            )}
        </Typography.Text>
    );
};

export default VideoTimeDisplay;
