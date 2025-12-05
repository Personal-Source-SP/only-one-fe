'use client';

import Image from 'next/image';
import { Dispatch, SetStateAction } from 'react';

const ImageItemDetail = ({
    imageUrl,
    fileId,
    setLoadingFiles,
}: {
    imageUrl: string;
    fileId: string;
    setLoadingFiles: Dispatch<SetStateAction<Set<string>>>;
}) => {
    return (
        <Image
            fill
            priority
            unoptimized
            src={imageUrl}
            alt={`File ${fileId}`}
            className="z-10 object-cover transition-opacity duration-200 group-hover:opacity-60"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onLoadStart={() => {
                setLoadingFiles((prev) => new Set(prev).add(fileId));
            }}
            onLoad={() => {
                setLoadingFiles((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(fileId);
                    return newSet;
                });
            }}
            onError={() => {
                setLoadingFiles((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(fileId);
                    return newSet;
                });
            }}
        />
    );
};

export default ImageItemDetail;
