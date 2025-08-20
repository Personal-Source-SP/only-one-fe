'use client';

import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Input,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { memo, FC } from 'react';

export type ToolbarProps = {
    searchQuery: string;
    filterFolder: string | null;
    sortOrder: 'newest' | 'oldest';
    folderItems: { key: string; label: string; value: string | null }[];
    onStartSlideshow: () => void;
    onSearchChange: (value: string) => void;
    onFilterFolderChange: (value: string | null) => void;
    onSortOrderChange: (value: 'newest' | 'oldest') => void;
};

const PhotosToolbar: FC<ToolbarProps> = ({
    searchQuery,
    filterFolder,
    sortOrder,
    folderItems,
    onStartSlideshow,
    onSearchChange,
    onFilterFolderChange,
    onSortOrderChange,
}) => {
    return (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <Input
                size="sm"
                value={searchQuery}
                className="w-full sm:w-64"
                onValueChange={onSearchChange}
                placeholder="Tìm kiếm ảnh của bạn..."
                startContent={<Icon icon="lucide:search" className="text-foreground-500" />}
            />

            <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                <Button color="primary" startContent={<Icon icon="lucide:upload" />} size="sm">
                    Tải ảnh lên
                </Button>
                <Dropdown>
                    <DropdownTrigger>
                        <Button
                            size="sm"
                            variant="flat"
                            color="primary"
                            startContent={<Icon icon="lucide:filter" />}
                        >
                            Lọc
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                        items={folderItems}
                        selectionMode="single"
                        selectedKeys={new Set([filterFolder ?? 'all'])}
                        onSelectionChange={(keys) => {
                            const key = Array.from(keys).at(0) as string | undefined;
                            if (key === 'all') onFilterFolderChange(null);
                            else if (key) onFilterFolderChange(key);
                        }}
                    >
                        {(item) => <DropdownItem key={item.key}>{item.label}</DropdownItem>}
                    </DropdownMenu>
                </Dropdown>
                <Dropdown>
                    <DropdownTrigger>
                        <Button
                            size="sm"
                            variant="flat"
                            color="primary"
                            startContent={<Icon icon="lucide:sort" />}
                        >
                            Sắp xếp
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                        selectionMode="single"
                        selectedKeys={new Set([sortOrder])}
                        onSelectionChange={(keys) => {
                            const key = Array.from(keys).at(0) as 'newest' | 'oldest' | undefined;
                            if (key) onSortOrderChange(key);
                        }}
                    >
                        <DropdownItem key="newest">Mới nhất trước</DropdownItem>
                        <DropdownItem key="oldest">Cũ nhất trước</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>

            <Button
                size="sm"
                variant="flat"
                color="primary"
                onPress={onStartSlideshow}
                startContent={<Icon icon="lucide:play" />}
            >
                Trình chiếu
            </Button>
        </div>
    );
};

export default memo(PhotosToolbar);
