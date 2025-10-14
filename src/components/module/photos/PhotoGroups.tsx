'use client';

import { List } from 'antd';
import { FC, memo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

type Photo = {
    id: string;
    url: string;
};

type PhotoGroup = {
    date?: string;
    photos: Photo[];
};

export type PhotoGroupsProps = {
    columns: number;
    groupedPhotos: PhotoGroup[];
    onPhotoClick: (url: string) => void;
};

const PhotoGroups: FC<PhotoGroupsProps> = ({ columns, groupedPhotos, onPhotoClick }) => {
    // Flatten all groups for InfiniteScroll usage for demo.
    const allPhotos = groupedPhotos.flatMap((group, groupIndex) =>
        group.photos.map((photo) => ({
            ...photo,
            date: group.date,
            groupIndex,
        })),
    );

    return (
        <section
            id="scrollablePhotoGroups"
            className="rounded-lg !overflow-auto !w-full !min-h-[500px]"
        >
            <InfiniteScroll
                loader={null}
                next={() => {}}
                hasMore={false} // Replace with your logic for more data
                dataLength={allPhotos.length}
                scrollableTarget="scrollablePhotoGroups"
            >
                <List
                    loading={false}
                    dataSource={groupedPhotos}
                    renderItem={(group, groupIdx) => (
                        <div key={groupIdx} style={{ marginBottom: 24 }}>
                            {group.date && <h2 className="text-lg font-medium">{group.date}</h2>}
                            <div
                                className={`grid grid-cols-${columns} gap-2`}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                                }}
                            >
                                {group.photos.map((photo) => (
                                    <div
                                        key={photo.id}
                                        onClick={() => onPhotoClick(photo.url)}
                                        className="aspect-[4/3] rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-all hover:shadow-md"
                                    >
                                        <img
                                            loading="lazy"
                                            src={photo.url}
                                            alt={`Photo ${photo.id}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                />
            </InfiniteScroll>
        </section>
    );
};

export default memo(PhotoGroups);
