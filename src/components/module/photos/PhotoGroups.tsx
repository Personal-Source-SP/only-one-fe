'use client';

import { List } from 'antd';
import { FC, memo, useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ViewMode } from '@/enums/photo.enum';
import { NGoogle } from '@/interfaces';

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

export type PhotoGroupsProps = {
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
                            url: file.thumbnailLink || file.webContentLink || '',
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
                            url: file.thumbnailLink || file.webContentLink || '',
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
                            url: file.thumbnailLink || file.webContentLink || '',
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
                    date: 'date' in group ? group.date : undefined,
                    folder: 'folder' in group ? group.folder : undefined,
                    groupIndex,
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
