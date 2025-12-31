'use client';

import {
    ExpandOutlined,
    FilterOutlined,
    PictureOutlined,
    PlayCircleOutlined,
    VideoCameraOutlined,
} from '@ant-design/icons';
import { Button, Empty, Flex, Tag } from 'antd';

interface MediaItem {
    id: string;
    url: string;
    thumbnail?: string;
    title: string;
    type: 'image' | 'video' | string;
    createdAt: string;
}

type GalleryGridViewProps = {
    items: MediaItem[];
    onItemClick: (index: number) => void;
    getDisplayTime: (date: string) => string;
};

const GalleryGridViewItem = ({
    index,
    item,
    onItemClick,
    getDisplayTime,
}: {
    index: number;
    item: MediaItem;
    onItemClick: (index: number) => void;
    getDisplayTime: (date: string) => string;
}) => {
    return (
        <Button
            type="text"
            key={item.id}
            onClick={() => onItemClick(index)}
            style={{ width: '100%', padding: 0 }}
            className="group relative aspect-square bg-slate-800 rounded-xl overflow-hidden cursor-pointer border border-slate-800 hover:border-indigo-500 transition-all duration-300 p-0 h-auto"
        >
            <img
                src={item.type === 'video' ? item.thumbnail || item.url : item.url}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
            />

            {/* Play Icon Overlay for Videos */}
            {item.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                    <div className="bg-white/20 backdrop-blur-sm p-2 sm:p-3 rounded-full border border-white/40">
                        <PlayCircleOutlined className="text-2xl sm:text-3xl text-white drop-shadow-md" />
                    </div>
                </div>
            )}

            {/* Tags (Top Left) */}
            <div className="absolute top-2 left-2 flex flex-wrap gap-1 z-10">
                <Tag
                    color={item.type === 'video' ? 'red' : 'blue'}
                    className="backdrop-blur-md text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 border border-white/10 m-0"
                >
                    {item.type === 'video' ? (
                        <VideoCameraOutlined className="text-xs" />
                    ) : (
                        <PictureOutlined className="text-xs" />
                    )}
                    <span className="font-medium">{item.type === 'video' ? 'Video' : 'Ảnh'}</span>
                </Tag>
                <Tag className="bg-black/60 backdrop-blur-md text-white text-[10px] px-1.5 py-0.5 rounded border border-white/10 m-0">
                    {getDisplayTime(item.createdAt)}
                </Tag>
            </div>

            {/* Info Overlay (Bottom) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <p className="font-medium text-sm truncate">{item.title}</p>
                <div className="flex items-center gap-1 text-xs text-slate-300 mt-1">
                    <ExpandOutlined className="text-xs" />
                    <span>Xem chi tiết</span>
                </div>
            </div>
        </Button>
    );
};

const GalleryGridView = ({ items, onItemClick, getDisplayTime }: GalleryGridViewProps) => {
    if (!items?.length) {
        return (
            <Flex vertical align="center" justify="center" className="h-full">
                <Empty
                    image={<FilterOutlined className="text-5xl text-slate-500 opacity-50" />}
                    description={<p className="text-slate-500">Không tìm thấy media nào.</p>}
                />
            </Flex>
        );
    }

    return (
        <div className="h-full overflow-y-auto p-3 sm:p-6 custom-scrollbar">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {items.map((item, index) => (
                    <GalleryGridViewItem
                        key={item.id}
                        item={item}
                        index={index}
                        onItemClick={onItemClick}
                        getDisplayTime={getDisplayTime}
                    />
                ))}
            </div>
        </div>
    );
};

export default GalleryGridView;
