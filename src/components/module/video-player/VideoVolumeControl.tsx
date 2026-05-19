'use client';

import { CustomButton, CustomSlider, CustomSpace } from '@/components/custom';
import { SoundOutlined } from '@ant-design/icons';

type VideoVolumeControlProps = {
    volume: number;
    isMuted: boolean;
    onToggleMute: () => void;
    onVolumeChange: (value: number) => void;
};

export const VideoVolumeControl = ({
    volume,
    isMuted,
    onToggleMute,
    onVolumeChange,
}: VideoVolumeControlProps) => {
    return (
        <CustomSpace.Compact className="items-center gap-2 group/volume ml-1 sm:ml-2">
            <CustomButton
                type="text"
                onClick={onToggleMute}
                style={{ width: 'auto', height: 'auto' }}
                icon={<SoundOutlined className="text-lg" />}
                className="text-white hover:text-indigo-400 border-none"
            />
            <div className="hidden sm:block w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300">
                <CustomSlider
                    min={0}
                    max={1}
                    step={0.05}
                    onChange={onVolumeChange}
                    className="volume-slider"
                    tooltip={{ formatter: null }}
                    value={isMuted ? 0 : volume}
                    styles={{
                        track: { background: 'rgba(255, 255, 255, 0.3)' },
                        rail: { background: 'rgba(255, 255, 255, 0.3)' },
                    }}
                />
            </div>
        </CustomSpace.Compact>
    );
};
