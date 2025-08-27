'use client';

import { SortOrder, ViewMode } from '@/enums';
import { NGoogleDrive, NPhoto } from '@/interfaces';
import { Button, Modal, Select } from 'antd';
import { Icon } from '@iconify/react';
import { FC, memo, useEffect, useMemo, useState } from 'react';

export type PhotoFilterProps = {
    isOpen: boolean;
    viewMode: ViewMode;
    sortOrder: SortOrder;
    folders: NGoogleDrive.DriveFolderResponse[];
    filterFolder?: string;
    onClose: (isOpen: boolean) => void;
    onApplyFilters: (filter: NPhoto.Filter) => void;
};

const PhotoFilter: FC<PhotoFilterProps> = ({
    isOpen,
    viewMode,
    sortOrder,
    folders,
    filterFolder,
    onClose,
    onApplyFilters,
}) => {
    const [pendingView, setPendingView] = useState<ViewMode>(viewMode);
    const [pendingSort, setPendingSort] = useState<SortOrder>(sortOrder);
    const [pendingFolder, setPendingFolder] = useState<string | undefined>(filterFolder);

    useEffect(() => {
        if (isOpen) {
            setPendingView(viewMode);
            setPendingSort(sortOrder);
            setPendingFolder(filterFolder);
        }
    }, [isOpen, filterFolder, sortOrder, viewMode]);

    const folderOptions: NPhoto.Folder[] = useMemo(() => {
        if (!folders.length) return [];

        const options: NPhoto.Folder[] = folders.map((f) => ({
            key: f.id,
            value: f.id,
            label: f.name,
        }));

        return [{ key: ViewMode.ALL, label: 'Tất cả thư mục', value: undefined }, ...options];
    }, [folders]);

    const renderFilter = () => {
        return (
            <div className="p-4 space-y-4">
                <div className="space-y-3">
                    <Select
                        size="small"
                        className="w-full"
                        placeholder="Thư mục"
                        value={pendingFolder}
                        onChange={(val) => setPendingFolder(val as string | undefined)}
                        options={folderOptions.map((i) => ({ value: i.value, label: i.label }))}
                    />

                    <Select
                        size="small"
                        className="w-full"
                        placeholder="Sắp xếp"
                        value={pendingSort}
                        onChange={(val) => setPendingSort(val as SortOrder)}
                        options={[
                            { value: SortOrder.NEWEST, label: 'Mới nhất trước' },
                            { value: SortOrder.OLDEST, label: 'Cũ nhất trước' },
                        ]}
                    />

                    <Select
                        size="small"
                        className="w-full"
                        placeholder="Chế độ xem"
                        value={pendingView}
                        onChange={(val) => setPendingView(val as ViewMode)}
                        options={[
                            { value: ViewMode.ALL, label: 'Xem tất cả' },
                            { value: ViewMode.TIME, label: 'Xem theo thời gian' },
                        ]}
                    />

                    <div className="pt-2">
                        <Button
                            type="primary"
                            className="w-full"
                            onClick={() => {
                                onApplyFilters({
                                    viewMode: pendingView,
                                    sortOrder: pendingSort,
                                    folderId: pendingFolder,
                                });
                                onClose(false);
                            }}
                        >
                            <span className="inline-flex items-center">
                                <Icon icon="lucide:filter" className="mr-2" /> Lọc
                            </span>
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Modal
            width={720}
            open={isOpen}
            centered
            onCancel={() => onClose(false)}
            footer={null}
            title={<div className="pb-0">Công cụ</div>}
        >
            {renderFilter()}
        </Modal>
    );
};

export default memo(PhotoFilter);
