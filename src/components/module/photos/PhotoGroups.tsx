'use client';

import { motion } from 'framer-motion';
import { memo, FC } from 'react';
import type { Photo } from '@/interfaces/photo';

export type PhotoGroupsProps = {
    groupedPhotos: { date: string; photos: Photo[] }[];
    columns: number;
    onPhotoClick: (url: string) => void;
};

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
};

const item = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1 },
};

const PhotoGroups: FC<PhotoGroupsProps> = ({ groupedPhotos, columns, onPhotoClick }) => {
    return (
        <div className="space-y-8">
            {groupedPhotos.map((group, groupIndex) => (
                <div key={groupIndex} className="space-y-2">
                    <h2 className="text-lg font-medium">{group.date}</h2>
                    <motion.div
                        className={`grid grid-cols-${columns} gap-2`}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                        }}
                        variants={container}
                        initial="hidden"
                        animate="show"
                    >
                        {group.photos.map((photo) => (
                            <motion.div
                                key={photo.id}
                                className="aspect-[4/3] rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-all hover:shadow-md"
                                variants={item}
                                onClick={() => onPhotoClick(photo.url)}
                            >
                                <img
                                    src={photo.url}
                                    alt={`Photo ${photo.id}`}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            ))}
        </div>
    );
};

export default memo(PhotoGroups);
