'use client';

import {
    CustomButton,
    CustomDropdown,
    CustomFlex,
    CustomSpace,
    CustomTypography,
} from '@/components/custom';
import { SettingOutlined } from '@ant-design/icons';

type VideoPlaybackSpeedMenuProps = {
    playbackRate: number;
    isSettingsOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onChangePlaybackRate: (rate: number) => void;
};

export const VideoPlaybackSpeedMenu = ({
    playbackRate,
    isSettingsOpen,
    onOpenChange,
    onChangePlaybackRate,
}: VideoPlaybackSpeedMenuProps) => {
    return (
        <CustomDropdown
            placement="topRight"
            open={isSettingsOpen}
            onOpenChange={onOpenChange}
            dropdownRender={() => (
                <div className="bg-slate-900/95 border border-slate-700 rounded-lg p-2 shadow-xl backdrop-blur-md min-w-[120px]">
                    <CustomTypography.Text className="text-[10px] uppercase text-slate-500 font-bold px-2 mb-1 block">
                        Tốc độ phát
                    </CustomTypography.Text>
                    <CustomSpace direction="vertical" size="small" className="w-full">
                        {[0.5, 1, 1.5, 2].map((rate) => (
                            <CustomButton
                                block
                                key={rate}
                                onClick={() => onChangePlaybackRate(rate)}
                                type={playbackRate === rate ? 'primary' : 'text'}
                                className={`text-left ${
                                    playbackRate === rate
                                        ? 'text-indigo-400 font-bold'
                                        : 'text-slate-300'
                                }`}
                            >
                                <CustomFlex justify="space-between" align="center">
                                    <span>{rate}x</span>
                                    {playbackRate === rate && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    )}
                                </CustomFlex>
                            </CustomButton>
                        ))}
                    </CustomSpace>
                </div>
            )}
        >
            <CustomButton
                type="text"
                title="Tốc độ phát"
                style={{ width: 'auto', height: 'auto' }}
                onClick={() => onOpenChange(!isSettingsOpen)}
                className="text-white hover:text-indigo-400 border-none"
                icon={<SettingOutlined className={isSettingsOpen ? 'rotate-45' : ''} />}
            />
        </CustomDropdown>
    );
};
