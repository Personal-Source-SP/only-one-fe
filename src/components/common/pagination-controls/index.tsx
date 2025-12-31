'use client';

import { FileItemsPerPage } from '@/enums';
import { Button, Dropdown, Flex, MenuProps, Pagination } from 'antd';

type PaginationControlsProps = {
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (value: number) => void;
};

const PaginationControls = ({
    totalItems,
    currentPage,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
}: PaginationControlsProps) => {
    const items: MenuProps['items'] = [
        { key: FileItemsPerPage.TEN.toString(), label: '10 ảnh/trang' },
        { key: FileItemsPerPage.TWENTY.toString(), label: '20 ảnh/trang' },
        { key: FileItemsPerPage.FIFTY.toString(), label: '50 ảnh/trang' },
        { key: FileItemsPerPage.HUNDRED.toString(), label: '100 ảnh/trang' },
    ];

    return (
        <Flex justify="space-between" align="center" gap={16}>
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
                responsive
                total={totalItems}
                current={currentPage}
                pageSize={itemsPerPage}
                showSizeChanger={false}
                onChange={onPageChange}
            />
        </Flex>
    );
};

export default PaginationControls;
