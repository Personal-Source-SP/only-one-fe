'use client';

import { DeleteOutlined, EditOutlined, EllipsisOutlined, EyeOutlined } from '@ant-design/icons';
import type { useTableReturnType } from '@refinedev/antd';
import type { BaseRecord } from '@refinedev/core';
import {
    CustomButton,
    CustomDropdown,
    CustomEmpty,
    CustomPopconfirm,
    CustomTable,
} from '@/components/custom-antd';
import type { ColumnType, ColumnsType, MenuProps, TableProps } from '@/components/custom-antd';
import type { CSSProperties, ReactNode } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';

import { useCustomDelete, usePagePermissions } from '@/hooks';
import { evaluateShow } from '@/utilities';

const tableHeaderCellProps: { style: CSSProperties } = {
    style: {
        paddingInline: 16,
    },
};

export interface TableCustomAction<RecordType> {
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

export interface ListTableProps<RecordType extends BaseRecord> extends TableProps<RecordType> {
    /** Table props returned from Refine's useTable hook */
    tableProps: TableProps<RecordType>;

    /** Table query returned from Refine's useTable for automatic refetch after delete. */
    tableQuery?: useTableReturnType<RecordType>['tableQuery'];

    /** Permission group for automatically checking View/Edit/Delete actions */
    permissionGroup?: string;

    /** Resource path for automatic delete handling. */
    deleteResource?: string;
    showDelete?: boolean | ((record: RecordType) => boolean);

    /** Called after automatic delete succeeds. */
    onDeleteSuccess?: () => void | Promise<void>;

    /** Additional custom actions */
    customRowActions?: TableCustomAction<RecordType>[];

    /** View detail callback */
    onView?: (record: RecordType) => void;
    showView?: boolean | ((record: RecordType) => boolean);

    /** Edit callback */
    onEdit?: (record: RecordType) => void;
    showEdit?: boolean | ((record: RecordType) => boolean);
}

export function ListTable<RecordType extends BaseRecord = BaseRecord>({
    tableProps,
    tableQuery,
    permissionGroup,
    deleteResource,
    showDelete,
    onDeleteSuccess,
    customRowActions = [],
    columns,
    loading,
    pagination,
    className = '',
    onView,
    showView,
    onEdit,
    showEdit,
    ...restProps
}: ListTableProps<RecordType>) {
    const keepOpenRef = useRef(false);
    const permissions = usePagePermissions(permissionGroup);

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
                                    handleDelete([(record as any).id ?? (record as any)._id]);
                                    if (onDeleteSuccess) await onDeleteSuccess();
                                    await tableQuery?.refetch();
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
            showView,
            showEdit,
            showDelete,
            customRowActions,
            keepOpenRef,
            onView,
            onEdit,
            handleDelete,
            onDeleteSuccess,
            tableQuery,
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

                const recordId = (record as any).id ?? (record as any)._id;
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
        getCustomActionItems,
        getColumnWidthStyle,
        handleCloseDropdown,
        showActionsColumn,
        openDropdownId,
        customRowActions,
    ]);

    const mergedLoading = useMemo(
        () => (loading !== undefined ? loading : tableProps.loading),
        [loading, tableProps.loading],
    );

    const mergedScroll = useMemo(() => {
        const baseScroll = restProps.scroll ?? tableProps.scroll;

        return {
            ...baseScroll,
            x: baseScroll?.x ?? 'max-content',
        };
    }, [restProps.scroll, tableProps.scroll]);

    const mergedPagination = useMemo(() => {
        if (pagination === false || tableProps.pagination === false) {
            return false;
        }

        const basePagination = pagination || tableProps.pagination;
        if (!basePagination) return false;

        return {
            ...basePagination,
            showSizeChanger: true,
            style: {
                ...basePagination.style,
                marginInlineEnd: 16,
            },
            showTotal: (total: number) => `Tổng số: ${total} mục`,
        };
    }, [pagination, tableProps.pagination]);

    const mergedTableProps = useMemo<TableProps<any>>(
        () => ({
            ...tableProps,
            ...restProps,
            tableLayout: 'fixed',
            locale: { emptyText: <CustomEmpty description="Không có dữ liệu" /> },
            style: {
                ...tableProps.style,
                ...restProps.style,
            },
            className:
                `overflow-hidden rounded-lg border border-solid border-gray-200 dark:border-gray-800 ${className}`.trim(),
            scroll: mergedScroll,
            pagination: mergedPagination,
        }),
        [tableProps, restProps, className, mergedScroll, mergedPagination],
    );

    return (
        <CustomTable
            columns={columnsWithActions}
            tableProps={mergedTableProps}
            loading={Boolean(mergedLoading)}
        />
    );
}
