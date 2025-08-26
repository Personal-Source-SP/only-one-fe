'use client';

import { PhotoItemsPerPage } from '@/enums';
import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Pagination,
} from '@heroui/react';
import { FC, memo } from 'react';

type PaginationControlsProps = {
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
                    selectionMode="single"
                    selectedKeys={new Set([itemsPerPage.toString()])}
                    onSelectionChange={(keys) => {
                        const key = Array.from(keys).at(0) as string | undefined;
                        if (key) onItemsPerPageChange(Number(key));
                    }}
                >
                    <DropdownItem key={PhotoItemsPerPage.TEN}>10 ảnh/trang</DropdownItem>
                    <DropdownItem key={PhotoItemsPerPage.TWENTY}>20 ảnh/trang</DropdownItem>
                    <DropdownItem key={PhotoItemsPerPage.FIFTY}>50 ảnh/trang</DropdownItem>
                    <DropdownItem key={PhotoItemsPerPage.HUNDRED}>100 ảnh/trang</DropdownItem>
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
