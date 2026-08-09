'use client';

import {
    CustomButton,
    CustomDropdown,
    CustomFlex,
    CustomPagination,
    MenuProps,
} from '@/components/custom-antd';
import { FileItemsPerPage } from '@/enums';

type PaginationControlsProps = {
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (value: number) => void;
};

export const PaginationControls = ({
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
        <CustomFlex justify="space-between" align="center" gap={16}>
            <CustomDropdown
                menu={{
                    items,
                    selectable: true,
                    selectedKeys: [itemsPerPage.toString()],
                    onClick: ({ key }) => onItemsPerPageChange(Number(key)),
                }}
            >
                <CustomButton>{itemsPerPage} ảnh/trang</CustomButton>
            </CustomDropdown>

            <CustomPagination
                responsive
                total={totalItems}
                current={currentPage}
                pageSize={itemsPerPage}
                showSizeChanger={false}
                onChange={onPageChange}
            />
        </CustomFlex>
    );
};
