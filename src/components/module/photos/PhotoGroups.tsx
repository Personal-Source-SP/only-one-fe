'use client';

import { Empty } from '@/components/common';
import { MimeType } from '@/enums';
import { ViewPhotoMode } from '@/enums/photo.enum';
import { PhotoGroup, PhotoItem } from '@/interfaces';
import { List, Spin, Tag } from 'antd';
import Image from 'next/image';
import { FC, memo, useMemo, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

type PhotoGroupsProps = {
    columns: number;
    data: PhotoItem[];
    displayMode: ViewPhotoMode;
    onPhotoClick: (photoId: string) => void;
};

const PhotoGroups: FC<PhotoGroupsProps> = ({ columns, displayMode, data, onPhotoClick }) => {
    const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

    const groupedPhotos: PhotoGroup[] = useMemo(() => {
        const photoFiles = data?.filter((file) => file.mimeType?.startsWith(MimeType.IMAGE));

        if (!photoFiles?.length) return [];

        switch (displayMode) {
            case ViewPhotoMode.ALL: {
                return [
                    {
                        photos: photoFiles,
                    },
                ];
            }

            case ViewPhotoMode.DATE: {
                const groupedByDate = photoFiles.reduce(
                    (groups, file) => {
                        const date = file.lastModified
                            ? new Date(file.lastModified).toLocaleDateString('vi-VN')
                            : 'Không xác định';

                        if (!groups[date]) {
                            groups[date] = [];
                        }

                        groups[date].push(file);

                        return groups;
                    },
                    {} as Record<string, PhotoItem[]>,
                );

                return Object.entries(groupedByDate).map(([date, photos]) => ({
                    date,
                    photos,
                }));
            }

            case ViewPhotoMode.FOLDER: {
                const groupedByFolder = photoFiles.reduce(
                    (groups, file) => {
                        const folderName = file.folderName || 'Không xác định';

                        if (!groups[folderName]) {
                            groups[folderName] = [];
                        }

                        groups[folderName].push(file);

                        return groups;
                    },
                    {} as Record<string, PhotoItem[]>,
                );

                return Object.entries(groupedByFolder).map(([folder, photos]) => ({
                    folder,
                    photos,
                }));
            }

            default:
                return [];
        }
    }, [displayMode, data]);

    const allPhotos = useMemo(
        () =>
            groupedPhotos.flatMap((group, groupIndex) =>
                group.photos.map((photo) => ({
                    ...photo,
                    groupIndex,
                    date: group.date,
                    folder: group.folder,
                })),
            ),
        [groupedPhotos],
    );

    const renderGroupHeader = (group: PhotoGroup) => {
        switch (displayMode) {
            case ViewPhotoMode.DATE: {
                return (
                    Boolean(group.date) && (
                        <Tag
                            color="blue"
                            className="text-base font-medium mb-4 px-4 py-1 rounded-full"
                        >
                            {group.date}
                        </Tag>
                    )
                );
            }

            case ViewPhotoMode.FOLDER: {
                return (
                    Boolean(group.folder) && (
                        <Tag
                            color="green"
                            className="text-base font-medium mb-4 px-4 py-1 rounded-full"
                        >
                            {group.folder}
                        </Tag>
                    )
                );
            }

            default:
                return null;
        }
    };

    const renderPhotos = () => {
        if (displayMode === ViewPhotoMode.ALL) {
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
                            onClick={() => onPhotoClick(photo.id)}
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
                                src={photo.url}
                                className="object-cover"
                                alt={`Photo ${photo.id}`}
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
                                    onClick={() => onPhotoClick(photo.id)}
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
                                        src={photo.url}
                                        className="object-cover"
                                        alt={`Photo ${photo.id}`}
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

    if (!allPhotos?.length) {
        return <Empty variant="file" />;
    }

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
