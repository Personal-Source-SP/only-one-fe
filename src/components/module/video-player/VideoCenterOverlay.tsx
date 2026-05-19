'use client';

import { CustomTypography } from '@/components/custom';
import { PlayCircleOutlined, ReloadOutlined } from '@ant-design/icons';

type VideoCenterOverlayProps = {
    isPlaying: boolean;
    seekFeedback: 'forward' | 'backward' | null;
};

export const VideoCenterOverlay = ({ isPlaying, seekFeedback }: VideoCenterOverlayProps) => {
    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {seekFeedback === 'backward' && (
                <div className="bg-black/50 p-4 rounded-full backdrop-blur-sm animate-in zoom-in fade-in flex flex-col items-center">
                    <ReloadOutlined className="text-2xl text-white mb-1" />
                    <CustomTypography.Text className="text-white text-xs font-bold">
                        -10s
                    </CustomTypography.Text>
                </div>
            )}

            {seekFeedback === 'forward' && (
                <div className="bg-black/50 p-4 rounded-full backdrop-blur-sm animate-in zoom-in fade-in flex flex-col items-center">
                    <ReloadOutlined className="text-2xl text-white mb-1 scale-x-[-1]" />
                    <CustomTypography.Text className="text-white text-xs font-bold">
                        +10s
                    </CustomTypography.Text>
                </div>
            )}

            {!seekFeedback && (
                <div
                    className={`transition-all duration-300 transform ${isPlaying ? 'opacity-0 scale-150' : 'opacity-100 scale-100'}`}
                >
                    <div className="bg-black/40 p-4 sm:p-5 rounded-full backdrop-blur-sm border border-white/20 shadow-xl group-hover:bg-indigo-600/80 group-hover:border-indigo-400 transition-colors">
                        <PlayCircleOutlined className="text-2xl sm:text-3xl text-white translate-x-1" />
                    </div>
                </div>
            )}
        </div>
    );
};
