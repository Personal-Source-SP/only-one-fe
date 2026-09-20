import type { ColumnsType, MenuProps, TableProps } from '@/components';
import type { UseCustomTableResponse } from '@/hooks';
import type { BaseKey, BaseRecord } from '@refinedev/core';
import type { Key, MouseEvent, ReactNode } from 'react';

// ==========================================
// LIST TABLE CUSTOM ACTION
// ==========================================

export interface ITableCustomAction<RecordType> {
    key: string;
    icon?: ReactNode;
    tooltip?: string;
    danger?: boolean;
    keepOpen?: boolean;
    width?: number | string;
    allowedRoles?: string[];
    show?: boolean | ((record: RecordType) => boolean);

    onClick: (record: RecordType) => void;
    render?: (record: RecordType, closeDropdown: () => void) => ReactNode;
}

// ==========================================
// MOBILE CARD ACTION ITEM
// ==========================================

export type IActionMenuItem = NonNullable<MenuProps['items']>[number] & {
    key?: Key;
    icon?: ReactNode;
    danger?: boolean;
    label?: ReactNode;
    onClick?: (info?: { domEvent?: MouseEvent<HTMLElement>; key?: Key }) => void;
};
export type { IActionMenuItem as ActionMenuItem };

// ==========================================
// PAGINATION CONTROLS CONTRACTS
// ==========================================

export type PaginationControlsProps = {
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    className?: string;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (value: number) => void;
};

// ==========================================
// MOBILE CARD LIST CONTRACTS
// ==========================================

export interface MobileCardListProps<RecordType extends BaseRecord> {
    dataSource: readonly RecordType[] | undefined;
    columns?: ColumnsType<RecordType>;
    tableQuery?: UseCustomTableResponse<RecordType>['tableQuery'];
    getCustomActionItems: (record: RecordType) => MenuProps['items'];
    handleDelete?: (id: BaseKey) => void;
    onDeleteSuccess?: () => void | Promise<void>;
    renderMobileCard?: (record: RecordType, actionItems: MenuProps['items']) => ReactNode;
}

export interface MobileCardActionsProps<RecordType extends BaseRecord> {
    record: RecordType;
    actions: MenuProps['items'];
    tableQuery?: UseCustomTableResponse<RecordType>['tableQuery'];
    handleDelete?: (id: BaseKey) => void;
    onDeleteSuccess?: () => void | Promise<void>;
}

// ==========================================
// LIST TABLE PROPS
// ==========================================

export interface ListTableProps<
    RecordType extends BaseRecord = BaseRecord,
    TTransformed extends BaseRecord = RecordType,
> extends TableProps<TTransformed> {
    /** Permission group for automatically checking View/Edit/Delete actions */
    permissionGroup?: string;

    /** Response trọn gói trả về từ useCustomTable hook */
    table: UseCustomTableResponse<RecordType, TTransformed>;

    /** View detail callback */
    onView?: (record: TTransformed) => void;
    showView?: boolean | ((record: TTransformed) => boolean);

    /** Edit callback */
    onEdit?: (record: TTransformed) => void;
    showEdit?: boolean | ((record: TTransformed) => boolean);

    /** Delete callback */
    deleteResource?: string;
    onDeleteSuccess?: () => void | Promise<void>;
    showDelete?: boolean | ((record: TTransformed) => boolean);

    /** Additional custom actions */
    customRowActions?: ITableCustomAction<TTransformed>[];

    /** Whether to use custom PaginationControls UI below table */
    usePaginationControls?: boolean;

    /** Custom title for DataNotFound empty state */
    emptyTitle?: string;

    /** Custom message for DataNotFound empty state */
    emptyMessage?: string;

    /** Render custom card trên màn hình nhỏ. Khuyến khích sử dụng CustomCard. Nếu không có sẽ hiển thị bảng cuộn ngang */
    renderMobileCard?: (record: TTransformed, actionItems: MenuProps['items']) => ReactNode;
}
