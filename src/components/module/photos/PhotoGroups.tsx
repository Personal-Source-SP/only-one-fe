'use client';

import type { Photo } from '@/interfaces/photo';
import { motion } from 'framer-motion';
import { FC, memo } from 'react';

export type PhotoGroupsProps = {
    columns: number;
    groupedPhotos: { date: string; photos: Photo[] }[];
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
    show: { opacity: 1, scale: 1 },
    hidden: { opacity: 0, scale: 0.9 },
};

const PhotoGroups: FC<PhotoGroupsProps> = ({ columns, groupedPhotos, onPhotoClick }) => {
    return (
        <div className="space-y-8">
            {groupedPhotos.map((group, groupIndex) => (
                <div key={groupIndex} className="space-y-2">
                    <h2 className="text-lg font-medium">{group.date}</h2>
                    <motion.div
                        animate="show"
                        initial="hidden"
                        variants={container}
                        className={`grid grid-cols-${columns} gap-2`}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                        }}
                    >
                        {group.photos.map((photo) => (
                            <motion.div
                                key={photo.id}
                                variants={item}
                                onClick={() => onPhotoClick(photo.url)}
                                className="aspect-[4/3] rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-all hover:shadow-md"
                            >
                                <img
                                    loading="lazy"
                                    src={photo.url}
                                    alt={`Photo ${photo.id}`}
                                    className="w-full h-full object-cover"
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
