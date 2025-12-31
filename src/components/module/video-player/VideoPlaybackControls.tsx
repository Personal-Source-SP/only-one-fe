'use client';

import { PauseOutlined, PlaySquareOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Space } from 'antd';

type VideoPlaybackControlsProps = {
    isPlaying: boolean;
    onTogglePlay: () => void;
    onSkip: (seconds: number) => void;
};

const VideoPlaybackControls = ({ isPlaying, onTogglePlay, onSkip }: VideoPlaybackControlsProps) => {
    return (
        <Space size="small" className="gap-2 sm:gap-4">
            <Button
                type="text"
                title="Lùi 10 giây"
                icon={<ReloadOutlined />}
                onClick={() => onSkip(-10)}
                style={{ width: 'auto', height: 'auto' }}
                className="text-white/80 hover:text-indigo-400 p-1 border-none"
            />

            <Button
                type="text"
                onClick={onTogglePlay}
                style={{ width: 'auto', height: 'auto' }}
                className="text-white hover:text-indigo-400 border-none"
                icon={
                    isPlaying ? (
                        <PauseOutlined className="text-xl sm:text-2xl" />
                    ) : (
                        <PlaySquareOutlined className="text-xl sm:text-2xl" />
                    )
                }
            />

            <Button
                type="text"
                title="Tua 10 giây"
                onClick={() => onSkip(10)}
                style={{ width: 'auto', height: 'auto' }}
                icon={<ReloadOutlined className="scale-x-[-1]" />}
                className="text-white/80 hover:text-indigo-400 p-1 border-none"
            />
        </Space>
    );
};

export default VideoPlaybackControls;
