'use client';

import { CustomModal } from '@/components/common';
import { SortOrder, ViewMode } from '@/enums';
import { NGoogle, Option } from '@/interfaces';
import { Icon } from '@iconify/react';
import { Button, Flex, Select, Space } from 'antd';
import { FC, memo, useEffect, useMemo, useState } from 'react';

export type PhotoFilterProps = {
    isOpen: boolean;
    viewMode: ViewMode;
    sortOrder: SortOrder;
    folders: NGoogle.IGoogleDriveFolder[];
    filterFolder?: string;
    onClose: (isOpen: boolean) => void;
    onApplyFilters: (filter: NGoogle.IGoogleDriveFolder) => void;
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

    const folderOptions: Option[] = useMemo(() => {
        if (!folders.length) return [];

        const options: Option[] = folders.map((f) => ({
            label: f.name,
            key: f.googleDriveId,
            value: f.googleDriveId,
        }));

        return [{ key: ViewMode.ALL, label: 'Tất cả thư mục', value: undefined }, ...options];
    }, [folders]);

    return (
        <CustomModal
            modalProps={{
                width: 560,
                open: isOpen,
                centered: true,
                title: 'Công cụ',
                footer: (
                    <Flex justify="space-between" align="center" gap={16}>
                        <Button
                            className="w-full"
                            icon={<Icon icon="lucide:x" />}
                            onClick={() => onClose(false)}
                        >
                            <span>Đóng</span>
                        </Button>
                        <Button
                            type="primary"
                            className="w-full"
                            icon={<Icon icon="lucide:filter" />}
                            onClick={() => {
                                // onApplyFilters({
                                //     viewMode: pendingView,
                                //     sortOrder: pendingSort,
                                //     folderId: pendingFolder,
                                // });
                                onClose(false);
                            }}
                        >
                            <span>Lọc</span>
                        </Button>
                    </Flex>
                ),
            }}
        >
            <Space direction="vertical" size="middle" className="!w-full h-full">
                <Select
                    placeholder="Thư mục"
                    value={pendingFolder}
                    options={folderOptions}
                    onChange={(val) => setPendingFolder(val as string | undefined)}
                />

                <Select
                    value={pendingSort}
                    placeholder="Sắp xếp"
                    onChange={(val) => setPendingSort(val as SortOrder)}
                    options={[
                        { value: SortOrder.NEWEST, label: 'Mới nhất trước' },
                        { value: SortOrder.OLDEST, label: 'Cũ nhất trước' },
                    ]}
                />

                <Select
                    value={pendingView}
                    placeholder="Chế độ xem"
                    onChange={(val) => setPendingView(val as ViewMode)}
                    options={[
                        { value: ViewMode.ALL, label: 'Xem tất cả' },
                        { value: ViewMode.TIME, label: 'Xem theo thời gian' },
                    ]}
                />
            </Space>
        </CustomModal>
    );
};

export default memo(PhotoFilter);
