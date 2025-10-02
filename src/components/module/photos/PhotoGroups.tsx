'use client';

import { NPhoto } from '@/interfaces';
import { Space } from 'antd';
import { FC, memo } from 'react';

export type PhotoGroupsProps = {
    columns: number;
    groupedPhotos: NPhoto.PhotoGroup[];
    onPhotoClick: (url: string) => void;
};

const PhotoGroups: FC<PhotoGroupsProps> = ({ columns, groupedPhotos, onPhotoClick }) => {
    return (
        <Space direction="vertical" size="large" className="w-full">
            {groupedPhotos.map((group, groupIndex) => (
                <div key={groupIndex} className="space-y-2">
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
            ))}
        </Space>
    );
};

export default memo(PhotoGroups);
