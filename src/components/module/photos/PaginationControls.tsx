'use client';

import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Pagination,
} from '@heroui/react';
import { FC, memo } from 'react';

export type PaginationControlsProps = {
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (value: number) => void;
};

const PaginationControls: FC<PaginationControlsProps> = ({
    totalItems,
    currentPage,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
}) => {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
            <Dropdown>
                <DropdownTrigger>
                    <Button variant="flat" size="sm">
                        {itemsPerPage} ảnh/trang
                    </Button>
                </DropdownTrigger>
                <DropdownMenu
                    selectedKeys={new Set([itemsPerPage.toString()])}
                    selectionMode="single"
                    onSelectionChange={(keys) => {
                        const key = Array.from(keys).at(0) as string | undefined;
                        if (key) onItemsPerPageChange(Number(key));
                    }}
                >
                    <DropdownItem key="10">10 ảnh/trang</DropdownItem>
                    <DropdownItem key="20">20 ảnh/trang</DropdownItem>
                    <DropdownItem key="50">50 ảnh/trang</DropdownItem>
                    <DropdownItem key="100">100 ảnh/trang</DropdownItem>
                </DropdownMenu>
            </Dropdown>

            <Pagination
                showControls
                color="primary"
                page={currentPage}
                onChange={onPageChange}
                total={Math.ceil(totalItems / itemsPerPage)}
            />
        </div>
    );
};

export default memo(PaginationControls);
