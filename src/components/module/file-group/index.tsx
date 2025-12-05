'use client';

import { Empty } from '@/components/common';
import { MimeType } from '@/enums';
import { ViewFileMode } from '@/enums/file.enum';
import { FileGroup, FileItem } from '@/interfaces';
import { DeleteOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Masonry, Spin, Tag, Tooltip } from 'antd';
import { useMemo, useState } from 'react';

import dayjs from 'dayjs';
import InfiniteScroll from 'react-infinite-scroll-component';
import { DEFAULT_FILE_IMAGE_URL } from '../../../constants';
import ImageItemDetail from './ImageItemDetail';
import VideoItemDetail from './VideoItemDetail';

type FileGroupsProps = {
    data: FileItem[];
    columns: number;
    displayMode: ViewFileMode;
    mimeType?: MimeType;
    onClickFile?: (fileId: string) => void;
    onDeleteFile?: (fileId: string) => void;
    onDownloadFile?: (fileId: string) => void;
};

const FileGroups = ({
    data,
    columns,
    displayMode,
    mimeType = MimeType.IMAGE,
    onClickFile,
    onDeleteFile,
    onDownloadFile,
}: FileGroupsProps) => {
    const [loadingFiles, setLoadingFiles] = useState<Set<string>>(new Set());

    const groupedFiles: FileGroup[] = useMemo(() => {
        const fileFilters = data?.filter((file) => file.mimeType?.startsWith(mimeType));
        if (!fileFilters?.length) return [];

        switch (displayMode) {
            case ViewFileMode.ALL: {
                return [{ files: fileFilters }];
            }

            case ViewFileMode.DATE: {
                const groupedByDate = fileFilters.reduce(
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
                    {} as Record<string, FileItem[]>,
                );

                return Object.entries(groupedByDate).map(([date, files]) => ({
                    date,
                    files,
                }));
            }

            case ViewFileMode.FOLDER: {
                const groupedByFolder = fileFilters.reduce(
                    (groups, file) => {
                        const folderName = file.folderName || 'Không xác định';

                        if (!groups[folderName]) {
                            groups[folderName] = [];
                        }

                        groups[folderName].push(file);

                        return groups;
                    },
                    {} as Record<string, FileItem[]>,
                );

                return Object.entries(groupedByFolder).map(([folder, files]) => ({
                    folder,
                    files,
                }));
            }

            default:
                return [];
        }
    }, [displayMode, data, mimeType]);

    const allFiles = useMemo(
        () =>
            groupedFiles.flatMap((group, groupIndex) =>
                group.files.map((file) => ({
                    ...file,
                    groupIndex,
                    date: group.date,
                    folder: group.folder,
                })),
            ),
        [groupedFiles],
    );

    const handleDownloadFile = (file: FileItem) => {
        if (onDownloadFile) {
            onDownloadFile(file.id ?? '');
        } else {
            const link = document.createElement('a');
            link.href = file.url;
            link.download = `file-${file.id}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const renderGroupHeader = (group: FileGroup) => {
        switch (displayMode) {
            case ViewFileMode.DATE: {
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

            case ViewFileMode.FOLDER: {
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

    const renderActionOverlay = (file: FileItem) => (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex gap-2">
                <Tooltip title="Xem chi tiết">
                    <Button
                        size="small"
                        type="primary"
                        icon={<EyeOutlined />}
                        disabled={!file.mimeType.startsWith(MimeType.IMAGE)}
                        onClick={(e) => {
                            e.stopPropagation();
                            onClickFile?.(file.id);
                        }}
                    />
                </Tooltip>
                <Tooltip title="Tải xuống">
                    <Button
                        size="small"
                        icon={<DownloadOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadFile(file);
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
                            onDeleteFile?.(file?.id ?? '');
                        }}
                    />
                </Tooltip>
            </div>
        </div>
    );

    const renderFileTag = (file: FileItem) => {
        const timestamp = file.lastModified ?? file.createdAt;
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

    const renderContent = (file: FileItem) => {
        switch (file.mimeType) {
            case MimeType.IMAGE: {
                return (
                    <ImageItemDetail
                        fileId={file.id}
                        imageUrl={file.url}
                        setLoadingFiles={setLoadingFiles}
                    />
                );
            }

            case MimeType.VIDEO: {
                return (
                    <VideoItemDetail
                        fileId={file.id}
                        videoUrl={file.url}
                        setLoadingFiles={setLoadingFiles}
                    />
                );
            }

            default: {
                return null;
            }
        }
    };

    const renderItem = (file: FileItem) => {
        const isImage = file.mimeType.startsWith(MimeType.IMAGE);
        const imageUrl = isImage ? file.url : DEFAULT_FILE_IMAGE_URL;

        return (
            <div
                key={file.id}
                onClick={() => (isImage ? onClickFile?.(file.id) : handleDownloadFile(file))}
                className="group relative aspect-[4/3] rounded-md overflow-hidden cursor-pointer transition-all hover:shadow-md bg-gray-100"
            >
                {loadingFiles.has(file.id) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <Spin size="small" />
                    </div>
                )}

                {renderFileTag(file)}
                {renderContent(file)}
                {renderActionOverlay(file)}
            </div>
        );
    };

    const renderFiles = () => {
        const items = allFiles.map((file) => ({
            data: file,
            key: file.id,
        }));

        if (displayMode === ViewFileMode.ALL) {
            return (
                <Masonry
                    items={items}
                    gutter={[8, 8]}
                    columns={columns}
                    itemRender={({ data }) => renderItem(data)}
                />
            );
        }

        return groupedFiles.map((group, groupIdx) => (
            <div key={groupIdx} style={{ marginBottom: 24 }}>
                {renderGroupHeader(group)}
                <Masonry
                    items={items}
                    gutter={[8, 8]}
                    columns={columns}
                    itemRender={({ data }) => renderItem(data)}
                />
            </div>
        ));
    };

    if (!allFiles?.length) {
        return <Empty variant="file" />;
    }

    return (
        <section
            id="scrollableFileGroups"
            className="rounded-lg !overflow-auto !w-full !min-h-[500px]"
        >
            <InfiniteScroll
                loader={null}
                next={() => {}}
                hasMore={false}
                dataLength={allFiles.length}
                scrollableTarget="scrollableFileGroups"
            >
                {renderFiles()}
            </InfiniteScroll>
        </section>
    );
};

export default FileGroups;
