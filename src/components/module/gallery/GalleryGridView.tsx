'use client';

import { MediaItem } from '@/interfaces';
import { FilterOutlined } from '@ant-design/icons';
import { Empty, Flex } from 'antd';

import GalleryGridViewItem from './GalleryGridViewItem';

type GalleryGridViewProps = {
    items: MediaItem[];
    onItemClick: (index: number) => void;
    getDisplayTime: (date: string) => string;
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
