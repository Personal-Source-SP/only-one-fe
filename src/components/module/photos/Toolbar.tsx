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
    onSearchChange: (value: string) => void;
    filterFolder: string | null;
    onFilterFolderChange: (value: string | null) => void;
    sortOrder: 'newest' | 'oldest';
    onSortOrderChange: (value: 'newest' | 'oldest') => void;
    folderItems: { key: string; label: string; value: string | null }[];
    onStartSlideshow: () => void;
};

const PhotosToolbar: FC<ToolbarProps> = ({
    searchQuery,
    onSearchChange,
    filterFolder,
    onFilterFolderChange,
    sortOrder,
    onSortOrderChange,
    folderItems,
    onStartSlideshow,
}) => {
    return (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <Input
                placeholder="Tìm kiếm ảnh của bạn..."
                startContent={<Icon icon="lucide:search" className="text-foreground-500" />}
                className="w-full sm:w-64"
                size="sm"
                value={searchQuery}
                onValueChange={onSearchChange}
            />

            <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                <Button color="primary" startContent={<Icon icon="lucide:upload" />} size="sm">
                    Tải ảnh lên
                </Button>
                <Dropdown>
                    <DropdownTrigger>
                        <Button
                            color="primary"
                            variant="flat"
                            startContent={<Icon icon="lucide:filter" />}
                            size="sm"
                        >
                            Lọc
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                        selectionMode="single"
                        selectedKeys={new Set([filterFolder ?? 'all'])}
                        onSelectionChange={(keys) => {
                            const key = Array.from(keys).at(0) as string | undefined;
                            if (key === 'all') onFilterFolderChange(null);
                            else if (key) onFilterFolderChange(key);
                        }}
                        items={folderItems}
                    >
                        {(item) => <DropdownItem key={item.key}>{item.label}</DropdownItem>}
                    </DropdownMenu>
                </Dropdown>
                <Dropdown>
                    <DropdownTrigger>
                        <Button
                            color="primary"
                            variant="flat"
                            startContent={<Icon icon="lucide:sort" />}
                            size="sm"
                        >
                            Sắp xếp
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                        selectedKeys={new Set([sortOrder])}
                        selectionMode="single"
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
                color="primary"
                variant="flat"
                startContent={<Icon icon="lucide:play" />}
                size="sm"
                onPress={onStartSlideshow}
            >
                Trình chiếu
            </Button>
        </div>
    );
};

export default memo(PhotosToolbar);
