'use client';

import { ViewMode } from '@/enums/photo.enum';
import { NGoogle } from '@/interfaces';
import { getProxyUrl } from '@/libs';
import { List, Spin } from 'antd';
import Image from 'next/image';
import { FC, memo, useMemo, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

type Photo = {
    id: string;
    url: string;
};

type PhotoGroup = {
    photos: Photo[];
} & (
    | { date: string; folder?: never }
    | { folder: string; date?: never }
    | { date?: never; folder?: never }
);

type PhotoGroupsProps = {
    columns: number;
    displayMode: ViewMode;
    googleDriveFiles: NGoogle.IGoogleDriveFile[];
    onPhotoClick: (url: string) => void;
};

const PhotoGroups: FC<PhotoGroupsProps> = ({
    columns,
    displayMode,
    googleDriveFiles,
    onPhotoClick,
}) => {
    const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

    const groupedPhotos = useMemo(() => {
        if (!googleDriveFiles?.length) return [];

        const photoFiles = googleDriveFiles?.filter(
            (file) => file.mimeType?.startsWith('image/') && file.thumbnailLink,
        );

        if (!photoFiles?.length) return [];

        switch (displayMode) {
            case ViewMode.ALL:
                return [
                    {
                        photos: photoFiles.map((file) => ({
                            id: file.id,
                            url:
                                file.webContentLink || file.thumbnailLink || file.webViewLink || '',
                        })),
                    },
                ];

            case ViewMode.DATE:
                const groupedByDate = photoFiles.reduce(
                    (groups, file) => {
                        const date = file.lastModified
                            ? new Date(file.lastModified).toLocaleDateString('vi-VN')
                            : 'Không xác định';

                        if (!groups[date]) {
                            groups[date] = [];
                        }
                        groups[date].push({
                            id: file.id,
                            url:
                                file.webContentLink || file.thumbnailLink || file.webViewLink || '',
                        });
                        return groups;
                    },
                    {} as Record<string, Photo[]>,
                );

                return Object.entries(groupedByDate).map(([date, photos]) => ({
                    date,
                    photos,
                }));

            case ViewMode.FOLDER:
                const groupedByFolder = photoFiles.reduce(
                    (groups, file) => {
                        const folderName = file.googleDriveFolder?.name || 'Không xác định';

                        if (!groups[folderName]) {
                            groups[folderName] = [];
                        }
                        groups[folderName].push({
                            id: file.id,
                            url:
                                file.webContentLink || file.thumbnailLink || file.webViewLink || '',
                        });
                        return groups;
                    },
                    {} as Record<string, Photo[]>,
                );

                return Object.entries(groupedByFolder).map(([folder, photos]) => ({
                    folder,
                    photos,
                }));

            default:
                return [];
        }
    }, [displayMode, googleDriveFiles]);

    const allPhotos = useMemo(
        () =>
            groupedPhotos.flatMap((group, groupIndex) =>
                group.photos.map((photo) => ({
                    ...photo,
                    groupIndex,
                    date: 'date' in group ? group.date : undefined,
                    folder: 'folder' in group ? group.folder : undefined,
                })),
            ),
        [groupedPhotos],
    );

    const renderGroupHeader = (group: PhotoGroup) => {
        switch (displayMode) {
            case ViewMode.DATE: {
                return (
                    'date' in group &&
                    group.date && <h2 className="text-lg font-medium mb-4">{group.date}</h2>
                );
            }

            case ViewMode.FOLDER: {
                return (
                    'folder' in group &&
                    group.folder && <h2 className="text-lg font-medium mb-4">{group.folder}</h2>
                );
            }

            default:
                return null;
        }
    };

    const renderPhotos = () => {
        if (displayMode === ViewMode.ALL) {
            return (
                <div
                    className="grid gap-2"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                    }}
                >
                    {allPhotos.map((photo) => (
                        <div
                            key={photo.id}
                            onClick={() => onPhotoClick(photo.url)}
                            className="relative aspect-[4/3] rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-all hover:shadow-md bg-gray-100"
                        >
                            {loadingImages.has(photo.id) && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                    <Spin size="small" />
                                </div>
                            )}

                            <Image
                                fill
                                priority
                                unoptimized
                                className="object-cover"
                                alt={`Photo ${photo.id}`}
                                src={getProxyUrl(photo.url)}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                onLoadStart={() => {
                                    setLoadingImages((prev) => new Set(prev).add(photo.id));
                                }}
                                onLoad={() => {
                                    setLoadingImages((prev) => {
                                        const newSet = new Set(prev);
                                        newSet.delete(photo.id);
                                        return newSet;
                                    });
                                }}
                                onError={() => {
                                    setLoadingImages((prev) => {
                                        const newSet = new Set(prev);
                                        newSet.delete(photo.id);
                                        return newSet;
                                    });
                                }}
                            />
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <List
                loading={false}
                dataSource={groupedPhotos}
                renderItem={(group, groupIdx) => (
                    <div key={groupIdx} style={{ marginBottom: 24 }}>
                        {renderGroupHeader(group)}
                        <div
                            className="grid gap-2"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                            }}
                        >
                            {group.photos.map((photo) => (
                                <div
                                    key={photo.id}
                                    onClick={() => onPhotoClick(photo.url)}
                                    className="relative aspect-[4/3] rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-all hover:shadow-md bg-gray-100"
                                >
                                    {loadingImages.has(photo.id) && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                            <Spin size="small" />
                                        </div>
                                    )}
                                    <Image
                                        fill
                                        priority
                                        unoptimized
                                        className="object-cover"
                                        alt={`Photo ${photo.id}`}
                                        src={getProxyUrl(photo.url)}
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        onLoadStart={() => {
                                            setLoadingImages((prev) => new Set(prev).add(photo.id));
                                        }}
                                        onLoad={() => {
                                            setLoadingImages((prev) => {
                                                const newSet = new Set(prev);
                                                newSet.delete(photo.id);
                                                return newSet;
                                            });
                                        }}
                                        onError={() => {
                                            setLoadingImages((prev) => {
                                                const newSet = new Set(prev);
                                                newSet.delete(photo.id);
                                                return newSet;
                                            });
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            />
        );
    };

    return (
        <section
            id="scrollablePhotoGroups"
            className="rounded-lg !overflow-auto !w-full !min-h-[500px]"
        >
            <InfiniteScroll
                loader={null}
                next={() => {}}
                hasMore={false}
                dataLength={allPhotos.length}
                scrollableTarget="scrollablePhotoGroups"
            >
                {renderPhotos()}
            </InfiniteScroll>
        </section>
    );
};

export default memo(PhotoGroups);
