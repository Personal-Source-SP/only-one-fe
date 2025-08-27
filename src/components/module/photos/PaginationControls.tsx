'use client';

import { PhotoItemsPerPage } from '@/enums';
import { Button, Dropdown, MenuProps, Pagination } from 'antd';
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
    const items: MenuProps['items'] = [
        { key: PhotoItemsPerPage.TEN.toString(), label: '10 ảnh/trang' },
        { key: PhotoItemsPerPage.TWENTY.toString(), label: '20 ảnh/trang' },
        { key: PhotoItemsPerPage.FIFTY.toString(), label: '50 ảnh/trang' },
        { key: PhotoItemsPerPage.HUNDRED.toString(), label: '100 ảnh/trang' },
    ];

    return (
        <div className="flex justify-between items-center mt-8 gap-4">
            <Dropdown
                menu={{
                    items,
                    selectable: true,
                    selectedKeys: [itemsPerPage.toString()],
                    onClick: ({ key }) => onItemsPerPageChange(Number(key)),
                }}
            >
                <Button>{itemsPerPage} ảnh/trang</Button>
            </Dropdown>

            <Pagination
                current={currentPage}
                onChange={onPageChange}
                total={totalItems}
                pageSize={itemsPerPage}
                showSizeChanger={false}
            />
        </div>
    );
};

export default memo(PaginationControls);
