'use client';

import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalHeader,
    Select,
    SelectItem,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { FC, memo, useEffect, useState } from 'react';

export type ToolbarProps = {
    searchQuery: string;
    viewMode: 'time' | 'all';
    filterFolder: string | null;
    sortOrder: 'newest' | 'oldest';
    folderItems: { key: string; label: string; value: string | null }[];
    onToggle: () => void;
    onStartSlideshow: () => void;
    onSearchChange: (value: string) => void;
    onFilterFolderChange: (value: string | null) => void;
    onSortOrderChange: (value: 'newest' | 'oldest') => void;
};

const PhotosToolbar: FC<ToolbarProps> = ({
    searchQuery,
    viewMode,
    filterFolder,
    sortOrder,
    folderItems,
    onToggle,
    onStartSlideshow,
    onSearchChange,
    onFilterFolderChange,
    onSortOrderChange,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [pendingFolder, setPendingFolder] = useState<string | 'all'>(filterFolder ?? 'all');
    const [pendingSort, setPendingSort] = useState<'newest' | 'oldest'>(sortOrder);
    const [pendingView, setPendingView] = useState<'all' | 'time'>(viewMode);

    useEffect(() => {
        if (isOpen) {
            setPendingFolder(filterFolder ?? 'all');
            setPendingSort(sortOrder);
            setPendingView(viewMode);
        }
    }, [isOpen, filterFolder, sortOrder, viewMode]);

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <Input
                    size="sm"
                    value={searchQuery}
                    className="w-full sm:w-64"
                    onValueChange={onSearchChange}
                    placeholder="Tìm kiếm ảnh của bạn..."
                    startContent={<Icon icon="lucide:search" className="text-foreground-500" />}
                />

                <div className="flex justify-between items-center w-full gap-2">
                    <Button
                        size="sm"
                        variant="flat"
                        color="primary"
                        className="w-full"
                        onPress={() => setIsOpen(true)}
                        startContent={<Icon icon="lucide:settings-2" />}
                    >
                        Bộ lọc
                    </Button>
                    <Button
                        size="sm"
                        variant="flat"
                        color="primary"
                        className="w-full"
                        onPress={onStartSlideshow}
                        startContent={<Icon icon="lucide:play" />}
                    >
                        Trình chiếu
                    </Button>
                </div>
            </div>

            <Modal
                size="lg"
                isOpen={isOpen}
                backdrop="opaque"
                placement="center"
                scrollBehavior="inside"
                onOpenChange={setIsOpen}
            >
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader className="pb-0">Công cụ</ModalHeader>
                            <ModalBody className="p-4 space-y-4">
                                <div className="space-y-3">
                                    <Select
                                        size="sm"
                                        label="Thư mục"
                                        selectedKeys={new Set([pendingFolder])}
                                        items={[
                                            { key: 'all', label: 'Tất cả thư mục' },
                                            ...folderItems.filter((f) => f.key !== 'all'),
                                        ]}
                                        onSelectionChange={(keys) => {
                                            const key = Array.from(keys).at(0) as
                                                | string
                                                | undefined;
                                            if (key) setPendingFolder(key as string);
                                        }}
                                    >
                                        {(item) => (
                                            <SelectItem key={item.key}>{item.label}</SelectItem>
                                        )}
                                    </Select>

                                    <Select
                                        size="sm"
                                        label="Sắp xếp"
                                        selectedKeys={new Set([pendingSort])}
                                        onSelectionChange={(keys) => {
                                            const key = Array.from(keys).at(0) as
                                                | 'newest'
                                                | 'oldest'
                                                | undefined;
                                            if (key) setPendingSort(key);
                                        }}
                                    >
                                        <SelectItem key="newest">Mới nhất trước</SelectItem>
                                        <SelectItem key="oldest">Cũ nhất trước</SelectItem>
                                    </Select>

                                    <Select
                                        size="sm"
                                        label="Chế độ xem"
                                        selectedKeys={new Set([pendingView])}
                                        onSelectionChange={(keys) => {
                                            const key = Array.from(keys).at(0) as
                                                | 'all'
                                                | 'time'
                                                | undefined;
                                            if (key) setPendingView(key);
                                        }}
                                    >
                                        <SelectItem key="all">Xem tất cả</SelectItem>
                                        <SelectItem key="time">Xem theo thời gian</SelectItem>
                                    </Select>

                                    <div className="pt-2">
                                        <Button
                                            color="primary"
                                            fullWidth
                                            startContent={<Icon icon="lucide:filter" />}
                                            onPress={() => {
                                                if (pendingSort !== sortOrder)
                                                    onSortOrderChange(pendingSort);
                                                const nextFolder =
                                                    pendingFolder === 'all' ? null : pendingFolder;
                                                if (nextFolder !== filterFolder)
                                                    onFilterFolderChange(nextFolder);
                                                if (pendingView !== viewMode) onToggle();
                                                setIsOpen(false);
                                            }}
                                        >
                                            Lọc
                                        </Button>
                                    </div>
                                </div>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
};

export default memo(PhotosToolbar);
