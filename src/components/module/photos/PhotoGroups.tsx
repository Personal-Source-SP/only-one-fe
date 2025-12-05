'use client';

import { Empty } from '@/components/common';
import { MimeType } from '@/enums';
import { ViewPhotoMode } from '@/enums/photo.enum';
import { PhotoGroup, PhotoItem } from '@/interfaces';
import { DeleteOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Masonry, Spin, Tag, Tooltip } from 'antd';
import dayjs from 'dayjs';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

type PhotoGroupsProps = {
    data: PhotoItem[];
    columns: number;
    displayMode: ViewPhotoMode;
    onPhotoClick: (photoId: string) => void;
    onDeletePhoto?: (photoId: string) => void;
    onDownloadPhoto?: (photoId: string) => void;
};

const PhotoGroups = ({
    columns,
    displayMode,
    data,
    onPhotoClick,
    onDeletePhoto,
    onDownloadPhoto,
}: PhotoGroupsProps) => {
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

    const handleDownloadPhoto = (photo: PhotoItem) => {
        if (onDownloadPhoto) {
            onDownloadPhoto(photo.id ?? '');
        } else {
            const link = document.createElement('a');
            link.href = photo.url;
            link.download = `photo-${photo.id}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

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

    const renderActionOverlay = (photo: PhotoItem) => (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex gap-2">
                <Tooltip title="Xem chi tiết">
                    <Button
                        size="small"
                        type="primary"
                        icon={<EyeOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            onPhotoClick(photo.id);
                        }}
                    />
                </Tooltip>
                <Tooltip title="Tải xuống">
                    <Button
                        size="small"
                        icon={<DownloadOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadPhoto(photo);
                        }}
                    />
                </Tooltip>
                <Tooltip title="Xóa">
                    <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeletePhoto?.(photo?.id ?? '');
                        }}
                    />
                </Tooltip>
            </div>
        </div>
    );

    const renderPhotoTag = (photo: PhotoItem) => {
        const timestamp = photo.lastModified ?? photo.createdAt;
        if (!timestamp) return null;

        const lastModified = dayjs(timestamp);
        if (!lastModified.isValid()) return null;

        const diffDays = dayjs().diff(lastModified, 'day');
        const label = diffDays < 1 ? 'Mới' : diffDays === 1 ? '1 ngày' : `${diffDays} ngày`;
        const color = diffDays < 1 ? 'red' : 'blue';

        return (
            <Tag
                color={color}
                className="absolute left-2 top-2 z-20 rounded-full px-3 py-1 text-xs font-medium"
            >
                {label}
            </Tag>
        );
    };

    const renderPhotoItem = (photo: PhotoItem) => (
        <div
            key={photo.id}
            onClick={() => onPhotoClick(photo.id)}
            className="group relative aspect-[4/3] rounded-md overflow-hidden cursor-pointer transition-all hover:shadow-md bg-gray-100"
        >
            {loadingImages.has(photo.id) && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <Spin size="small" />
                </div>
            )}

            {renderPhotoTag(photo)}

            <Image
                fill
                priority
                unoptimized
                src={photo.url}
                className="z-10 object-cover transition-opacity duration-200 group-hover:opacity-60"
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

            {renderActionOverlay(photo)}
        </div>
    );

    const renderPhotos = () => {
        if (displayMode === ViewPhotoMode.ALL) {
            return (
                <Masonry
                    items={allPhotos.map((photo) => ({
                        key: photo.id,
                        data: photo,
                    }))}
                    columns={columns}
                    gutter={[8, 8]}
                    itemRender={({ data }) => renderPhotoItem(data)}
                />
            );
        }

        return groupedPhotos.map((group, groupIdx) => (
            <div key={groupIdx} style={{ marginBottom: 24 }}>
                {renderGroupHeader(group)}
                <Masonry
                    items={group.photos.map((photo) => ({
                        key: photo.id,
                        data: photo,
                    }))}
                    columns={columns}
                    gutter={[8, 8]}
                    itemRender={({ data }) => renderPhotoItem(data)}
                />
            </div>
        ));
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

export default PhotoGroups;
