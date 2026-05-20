'use client';

import { CustomButton, CustomSpace } from '@/components/custom';
import { PauseOutlined, PlaySquareOutlined, ReloadOutlined } from '@ant-design/icons';

type VideoPlaybackControlsProps = {
    isPlaying: boolean;
    onTogglePlay: () => void;
    onSkip: (seconds: number) => void;
};

export const VideoPlaybackControls = ({
    isPlaying,
    onTogglePlay,
    onSkip,
}: VideoPlaybackControlsProps) => {
    return (
        <CustomSpace size="small" className="gap-2 sm:gap-4">
            <CustomButton
                type="text"
                title="Lùi 10 giây"
                icon={<ReloadOutlined />}
                onClick={() => onSkip(-10)}
                style={{ width: 'auto', height: 'auto' }}
                className="text-white/80 hover:text-hub-primary p-1 border-none"
            />

            <CustomButton
                type="text"
                onClick={onTogglePlay}
                style={{ width: 'auto', height: 'auto' }}
                className="text-white hover:text-hub-primary border-none"
                icon={
                    isPlaying ? (
                        <PauseOutlined className="text-xl sm:text-2xl" />
                    ) : (
                        <PlaySquareOutlined className="text-xl sm:text-2xl" />
                    )
                }
            />

            <CustomButton
                type="text"
                title="Tua 10 giây"
                onClick={() => onSkip(10)}
                style={{ width: 'auto', height: 'auto' }}
                icon={<ReloadOutlined className="scale-x-[-1]" />}
                className="text-white/80 hover:text-hub-primary p-1 border-none"
            />
        </CustomSpace>
    );
};
