'use client';

import { DataNotFound, MobileCardList, PaginationControls } from '@/components/common';
import type { ColumnType, ColumnsType, MenuProps, TableProps } from '@/components/custom-antd';
import {
    CustomButton,
    CustomDropdown,
    CustomGrid,
    CustomPopconfirm,
    CustomTable,
} from '@/components/custom-antd';
import { useCustomDelete, usePagePermissions } from '@/hooks';
import type { ITableCustomAction } from '@/interfaces';
import { evaluateShow, getBackendErrorMessage } from '@/utilities';
import { DeleteOutlined, EditOutlined, EllipsisOutlined, EyeOutlined } from '@ant-design/icons';
import type { useTableReturnType } from '@refinedev/antd';
import type { BaseRecord } from '@refinedev/core';
import type { CSSProperties, ReactNode } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { getRecordId } from './utils';

const tableHeaderCellProps: { style: CSSProperties } = {
    style: {
        paddingInline: 16,
    },
};

export interface ListTableProps<RecordType extends BaseRecord> extends TableProps<RecordType> {
    /** Permission group for automatically checking View/Edit/Delete actions */
    permissionGroup?: string;

    /** Table props returned from Refine's useTable hook */
    tableProps: TableProps<RecordType>;

    /** Table query returned from Refine's useTable for automatic refetch after delete. */
    tableQuery?: useTableReturnType<RecordType>['tableQuery'];

    /** View detail callback */
    onView?: (record: RecordType) => void;
    showView?: boolean | ((record: RecordType) => boolean);

    /** Edit callback */
    onEdit?: (record: RecordType) => void;
    showEdit?: boolean | ((record: RecordType) => boolean);

    /** Delete callback */
    deleteResource?: string;
    onDeleteSuccess?: () => void | Promise<void>;
    showDelete?: boolean | ((record: RecordType) => boolean);

    /** Additional custom actions */
    customRowActions?: ITableCustomAction<RecordType>[];

    /** Whether to use custom PaginationControls UI below table */
    usePaginationControls?: boolean;

    /** Custom title for DataNotFound empty state */
    emptyTitle?: string;

    /** Custom message for DataNotFound empty state */
    emptyMessage?: string;

    /** Render custom card trên màn hình nhỏ. Khuyến khích sử dụng CustomCard. Nếu không có sẽ hiển thị bảng cuộn ngang */
    renderMobileCard?: (record: RecordType, actionItems: MenuProps['items']) => ReactNode;
}

export function ListTable<RecordType extends BaseRecord = BaseRecord>({
    permissionGroup,
    tableProps,
    tableQuery,
    onView,
    showView,
    onEdit,
    showEdit,
    deleteResource,
    onDeleteSuccess,
    showDelete,
    customRowActions = [],
    usePaginationControls = true,
    pagination,
    emptyTitle,
    emptyMessage,
    renderMobileCard,
    columns,
    className = '',
    ...restProps
}: ListTableProps<RecordType>) {
    const keepOpenRef = useRef(false);
    const screens = CustomGrid.useBreakpoint();
    const permissions = usePagePermissions(permissionGroup);
    const isMobile = (screens.xs || screens.sm) && !screens.md;

    const [openDropdownId, setOpenDropdownId] = useState<string | number>();

    const { handleDelete } = useCustomDelete({
        resource: deleteResource ?? '',
    });

    const hasView = useMemo(() => !!onView && permissions.canRead, [onView, permissions.canRead]);
    const hasEdit = useMemo(() => !!onEdit && permissions.canEdit, [onEdit, permissions.canEdit]);
    const hasDelete = useMemo(
        () => !!deleteResource && permissions.canDelete,
        [deleteResource, permissions.canDelete],
    );

    const showActionsColumn = useMemo(
        () => hasView || hasEdit || hasDelete || !!customRowActions.length,
        [hasView, hasEdit, hasDelete, customRowActions.length],
    );

    const handleCloseDropdown = useCallback(() => {
        setOpenDropdownId(undefined);
    }, []);

    const getColumnWidthStyle = useCallback((column: ColumnType<RecordType>) => {
        if (!column.width) return {};

        return {
            width: column.width,
            minWidth: column.width,
            maxWidth: column.width,
        };
    }, []);

    const getCustomActionItems = useCallback(
        (record: RecordType): MenuProps['items'] => {
            const items: MenuProps['items'] = [];

            const canShowView = hasView && evaluateShow(showView, record);
            const canShowEdit = hasEdit && evaluateShow(showEdit, record);
            const canShowDelete = hasDelete && evaluateShow(showDelete, record);

            if (canShowView) {
                items.push({
                    key: 'view',
                    icon: <EyeOutlined />,
                    label: 'Xem chi tiết',
                    onClick: () => onView?.(record),
                });
            }

            if (canShowEdit) {
                items.push({
                    key: 'edit',
                    icon: <EditOutlined />,
                    label: 'Chỉnh sửa',
                    onClick: () => onEdit?.(record),
                });
            }

            if (canShowDelete) {
                items.push({
                    danger: true,
                    key: 'delete',
                    icon: <DeleteOutlined />,
                    label: (
                        <>
                            <CustomPopconfirm
                                okText="Xác nhận"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                                title="Xác nhận xóa"
                                description="Bạn có chắc chắn muốn xóa mục này không?"
                                onCancel={handleCloseDropdown}
                                onConfirm={async () => {
                                    const id = getRecordId(record);
                                    if (id != null && id !== '') {
                                        handleDelete(id);
                                        if (onDeleteSuccess) await onDeleteSuccess();
                                        await tableQuery?.refetch();
                                    }
                                    handleCloseDropdown();
                                }}
                            >
                                <span className="absolute inset-0 z-10" />
                            </CustomPopconfirm>
                            <span>Xóa</span>
                        </>
                    ),
                    onClick: (info) => {
                        info.domEvent.stopPropagation();
                        keepOpenRef.current = true;
                    },
                });
            }

            if (customRowActions.length) {
                const customItems = customRowActions
                    .filter((action) => evaluateShow(action.show, record))
                    .map((action) => {
                        const rendered = action.render
                            ? action.render(record, handleCloseDropdown)
                            : null;

                        if (action.render && rendered == null) {
                            return null;
                        }

                        const item: NonNullable<MenuProps['items']>[number] = {
                            key: action.key,
                            icon: action.icon,
                            danger: action.danger,
                            label: action.render ? rendered : action.tooltip || action.key,
                            onClick: (info) => {
                                if (action.keepOpen) {
                                    info.domEvent.stopPropagation();
                                    keepOpenRef.current = true;
                                }

                                action.onClick(record);
                            },
                        };

                        return item;
                    })
                    .filter(Boolean) as NonNullable<MenuProps['items']>;

                items.push(...customItems);
            }

            return items;
        },
        [
            hasView,
            hasEdit,
            hasDelete,
            keepOpenRef,
            showView,
            showEdit,
            showDelete,
            tableQuery,
            customRowActions,
            onView,
            onEdit,
            handleDelete,
            onDeleteSuccess,
            handleCloseDropdown,
        ],
    );

    const columnsWithActions = useMemo(() => {
        const styleColumns = (columns || []).map((column) => ({
            ...column,
            onCell: (record: RecordType, rowIndex?: number) => {
                const customProps = column?.onCell?.(record, rowIndex);
                return {
                    ...customProps,
                    style: {
                        ...getColumnWidthStyle(column),
                        ...customProps?.style,
                    },
                };
            },
            onHeaderCell: (col: ColumnsType<RecordType>[number]) => {
                const customProps = column?.onHeaderCell?.(col as never);
                return {
                    ...tableHeaderCellProps,
                    ...customProps,
                    style: {
                        ...tableHeaderCellProps.style,
                        ...getColumnWidthStyle(column),
                        ...customProps?.style,
                    },
                };
            },
        }));

        if (!showActionsColumn) return styleColumns;

        const actionsColumn = {
            width: 60,
            dataIndex: 'actions',
            fixed: 'right' as const,
            align: 'center' as const,
            title: 'Hành động',
            onHeaderCell: () => ({
                style: {
                    ...tableHeaderCellProps.style,
                    whiteSpace: 'nowrap',
                },
            }),
            onCell: () => ({
                style: {
                    overflow: 'visible',
                    whiteSpace: 'nowrap',
                },
            }),
            render: (_: unknown, record: RecordType) => {
                const actionItems = getCustomActionItems(record);
                if (!actionItems?.length) return null;

                const recordId = getRecordId(record);
                const isOpen = recordId != null && openDropdownId === recordId;

                return (
                    <CustomDropdown
                        open={isOpen}
                        trigger={['click']}
                        onOpenChange={(open) => {
                            if (open && recordId != null) {
                                setOpenDropdownId(recordId);
                                return;
                            }

                            if (keepOpenRef.current) {
                                keepOpenRef.current = false;
                            } else {
                                setOpenDropdownId(undefined);
                            }
                        }}
                        menu={{
                            items: actionItems,
                            onClick: (info) => {
                                const customAction = customRowActions.find(
                                    (act) => act.key === info.key,
                                );

                                if (info.key !== 'delete' && !customAction?.keepOpen) {
                                    handleCloseDropdown();
                                }
                            },
                        }}
                    >
                        <CustomButton type="text" icon={<EllipsisOutlined />} />
                    </CustomDropdown>
                );
            },
        };

        return [...(styleColumns || []), actionsColumn];
    }, [
        columns,
        customRowActions,
        getCustomActionItems,
        getColumnWidthStyle,
        handleCloseDropdown,
        showActionsColumn,
        openDropdownId,
    ]);

    const mergedScroll = useMemo(() => {
        const baseScroll = restProps.scroll ?? tableProps.scroll;

        return {
            ...baseScroll,
            x: baseScroll?.x ?? 'max-content',
        };
    }, [restProps.scroll, tableProps.scroll]);

    const basePaginationObj = useMemo(() => {
        if (pagination === false || tableProps.pagination === false) {
            return null;
        }

        const basePag = pagination || tableProps.pagination;
        if (!basePag) return null;

        return basePag;
    }, [pagination, tableProps.pagination]);

    const mergedPagination = useMemo(() => {
        if (!basePaginationObj) return false;

        // If usePaginationControls is active, disable standard Antd pagination inside table
        if (usePaginationControls) return false;

        return {
            ...basePaginationObj,
            showSizeChanger: true,
            style: {
                ...basePaginationObj.style,
                marginInlineEnd: 16,
            },
            showTotal: (total: number) => `Tổng số: ${total} mục`,
        };
    }, [basePaginationObj, usePaginationControls]);

    const mergedTableProps = useMemo<TableProps<any>>(
        () => ({
            ...tableProps,
            ...restProps,
            tableLayout: 'fixed',
            locale: {
                emptyText: (
                    <DataNotFound
                        compact
                        onRetry={tableQuery?.refetch}
                        title={emptyTitle ?? 'Không có dữ liệu'}
                        message={emptyMessage ?? 'Chưa có bản ghi nào phù hợp.'}
                    />
                ),
            },
            style: {
                ...tableProps.style,
                ...restProps.style,
            },
            className:
                `overflow-hidden rounded-xl border border-solid border-hub-border-card shadow-sm ${className}`.trim(),
            scroll: mergedScroll,
            pagination: mergedPagination,
        }),
        [
            tableProps,
            restProps,
            className,
            emptyTitle,
            emptyMessage,
            mergedScroll,
            mergedPagination,
        ],
    );

    const paginationData = useMemo(() => {
        if (!usePaginationControls || !basePaginationObj) return null;

        const total = basePaginationObj.total ?? 0;
        const current = basePaginationObj.current ?? 1;
        const pageSize = basePaginationObj.pageSize ?? 10;

        return {
            total,
            current,
            pageSize,
            onChange: (page: number) => {
                basePaginationObj.onChange?.(page, pageSize);
            },
            onItemsPerPageChange: (size: number) => {
                basePaginationObj.onChange?.(1, size);
            },
        };
    }, [usePaginationControls, basePaginationObj]);

    if (tableQuery?.error) {
        return (
            <DataNotFound
                onRetry={tableQuery?.refetch}
                icon="lucide:alert-triangle"
                title="Tải dữ liệu không thành công"
                message={getBackendErrorMessage(tableQuery.error)}
            />
        );
    }

    return (
        <div className="w-full">
            {isMobile ? (
                <MobileCardList
                    columns={columns}
                    tableQuery={tableQuery}
                    dataSource={mergedTableProps.dataSource}
                    handleDelete={handleDelete}
                    onDeleteSuccess={onDeleteSuccess}
                    renderMobileCard={renderMobileCard}
                    getCustomActionItems={getCustomActionItems}
                />
            ) : (
                <CustomTable
                    columns={columnsWithActions}
                    tableProps={mergedTableProps}
                    loading={Boolean(tableProps?.loading)}
                />
            )}

            {paginationData && (
                <PaginationControls
                    className="pt-4"
                    totalItems={paginationData.total}
                    currentPage={paginationData.current}
                    itemsPerPage={paginationData.pageSize}
                    onPageChange={paginationData.onChange}
                    onItemsPerPageChange={paginationData.onItemsPerPageChange}
                />
            )}
        </div>
    );
}
