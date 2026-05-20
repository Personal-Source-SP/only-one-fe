'use client';

import { CustomButton, CustomTag } from '@/components/custom';
import { MediaType } from '@/enums';
import { MediaItem } from '@/interfaces';
import {
    ExpandOutlined,
    PictureOutlined,
    PlayCircleOutlined,
    VideoCameraOutlined,
} from '@ant-design/icons';

type GalleryGridViewItemProps = {
    index: number;
    item: MediaItem;
    onItemClick: (index: number) => void;
    getDisplayTime: (date: string) => string;
};

export const GalleryGridViewItem = ({
    index,
    item,
    onItemClick,
    getDisplayTime,
}: GalleryGridViewItemProps) => {
    return (
        <CustomButton
            type="text"
            key={item.id}
            onClick={() => onItemClick(index)}
            style={{ width: '100%', padding: 0 }}
            className="group relative aspect-square bg-slate-800 rounded-xl overflow-hidden cursor-pointer border border-slate-800 hover:border-hub-primary transition-all duration-300 p-0 h-auto"
        >
            <img
                loading="lazy"
                alt={item.title}
                src={item.type === MediaType.VIDEO ? item.thumbnail || item.url : item.url}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* Play Icon Overlay for Videos */}
            {item.type === MediaType.VIDEO && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                    <div className="bg-white/20 backdrop-blur-sm p-2 sm:p-3 rounded-full border border-white/40">
                        <PlayCircleOutlined className="text-2xl sm:text-3xl text-white drop-shadow-md" />
                    </div>
                </div>
            )}

            {/* Tags (Top Left) */}
            <div className="absolute top-2 left-2 flex flex-wrap gap-1 z-10">
                <CustomTag
                    color={item.type === MediaType.VIDEO ? 'red' : 'blue'}
                    className="backdrop-blur-md text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 border border-white/10 m-0"
                >
                    {item.type === MediaType.VIDEO ? (
                        <VideoCameraOutlined className="text-xs" />
                    ) : (
                        <PictureOutlined className="text-xs" />
                    )}

                    <span className="font-medium">
                        {item.type === MediaType.VIDEO ? 'Video' : 'Ảnh'}
                    </span>
                </CustomTag>
                <CustomTag className="bg-black/60 backdrop-blur-md text-white text-[10px] px-1.5 py-0.5 rounded border border-white/10 m-0">
                    {getDisplayTime(item.createdAt)}
                </CustomTag>
            </div>

            {/* Info Overlay (Bottom) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <p className="font-medium text-sm truncate">{item.title}</p>
                <div className="flex items-center gap-1 text-xs text-slate-300 mt-1">
                    <ExpandOutlined className="text-xs" />
                    <span>Xem chi tiết</span>
                </div>
            </div>
        </CustomButton>
    );
};
