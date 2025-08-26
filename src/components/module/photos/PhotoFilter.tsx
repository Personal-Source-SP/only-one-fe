'use client';

import { SortOrder, ViewMode } from '@/enums';
import { NGoogleDrive, NPhoto } from '@/interfaces';
import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalHeader,
    Select,
    SelectItem,
} from '@heroui/react';
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
            <>
                <ModalHeader className="pb-0">Công cụ</ModalHeader>
                <ModalBody className="p-4 space-y-4">
                    <div className="space-y-3">
                        <Select
                            size="sm"
                            label="Thư mục"
                            items={folderOptions}
                            selectedKeys={pendingFolder ? new Set([pendingFolder]) : undefined}
                            onSelectionChange={(keys) => {
                                const key = Array.from(keys).at(0) as string | undefined;
                                if (key) setPendingFolder(key as string);
                            }}
                        >
                            {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
                        </Select>

                        <Select
                            size="sm"
                            label="Sắp xếp"
                            selectedKeys={new Set([pendingSort])}
                            onSelectionChange={(keys) => {
                                const key = Array.from(keys).at(0) as SortOrder | undefined;
                                if (key) setPendingSort(key);
                            }}
                        >
                            <SelectItem key={SortOrder.NEWEST}>Mới nhất trước</SelectItem>
                            <SelectItem key={SortOrder.OLDEST}>Cũ nhất trước</SelectItem>
                        </Select>

                        <Select
                            size="sm"
                            label="Chế độ xem"
                            selectedKeys={new Set([pendingView])}
                            onSelectionChange={(keys) => {
                                const key = Array.from(keys).at(0) as ViewMode | undefined;
                                if (key) setPendingView(key);
                            }}
                        >
                            <SelectItem key={ViewMode.ALL}>Xem tất cả</SelectItem>
                            <SelectItem key={ViewMode.TIME}>Xem theo thời gian</SelectItem>
                        </Select>

                        <div className="pt-2">
                            <Button
                                fullWidth
                                color="primary"
                                startContent={<Icon icon="lucide:filter" />}
                                onPress={() => {
                                    onApplyFilters({
                                        viewMode: pendingView,
                                        sortOrder: pendingSort,
                                        folderId: pendingFolder,
                                    });

                                    onClose(false);
                                }}
                            >
                                Lọc
                            </Button>
                        </div>
                    </div>
                </ModalBody>
            </>
        );
    };

    return (
        <Modal
            size="lg"
            isOpen={isOpen}
            backdrop="opaque"
            placement="center"
            scrollBehavior="inside"
            onOpenChange={onClose}
        >
            <ModalContent>{renderFilter()}</ModalContent>
        </Modal>
    );
};

export default memo(PhotoFilter);
