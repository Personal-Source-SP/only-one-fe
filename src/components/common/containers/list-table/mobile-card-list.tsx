import { DeleteOutlined } from '@ant-design/icons';
import type { useTableReturnType } from '@refinedev/antd';
import type { BaseRecord } from '@refinedev/core';
import { get, isEmpty, isNil } from 'lodash';
import type { ReactNode } from 'react';

import type { ColumnType, ColumnsType, MenuProps } from '@/components/custom-antd';
import {
    CustomButton,
    CustomCard,
    CustomFlex,
    CustomPopconfirm,
    CustomTypography,
} from '@/components/custom-antd';
import type { TableCustomAction } from './index';
import { getRecordId } from './utils';

const { Text } = CustomTypography;

export interface MobileCardListProps<RecordType extends BaseRecord> {
    columns?: ColumnsType<RecordType>;
    dataSource: readonly RecordType[] | undefined;
    customRowActions: TableCustomAction<RecordType>[];
    tableQuery?: useTableReturnType<RecordType>['tableQuery'];
    handleCloseDropdown: () => void;
    setOpenDropdownId: (id: string | number | undefined) => void;
    getCustomActionItems: (record: RecordType) => MenuProps['items'];
    renderMobileCard?: (record: RecordType, actionItems: MenuProps['items']) => ReactNode;
    handleDelete?: (ids: string[]) => void;
    onDeleteSuccess?: () => void | Promise<void>;
}

export function MobileCardList<RecordType extends BaseRecord>({
    columns,
    dataSource,
    tableQuery,
    getCustomActionItems,
    renderMobileCard,
    handleDelete,
    onDeleteSuccess,
}: MobileCardListProps<RecordType>) {
    const renderActions = (record: RecordType, actions: MenuProps['items']) => {
        if (isEmpty(actions)) return null;

        const actionArray = (actions || []) as Array<any>;

        return (
            <CustomFlex
                justify="end"
                align="center"
                gap={8}
                wrap="wrap"
                className="mt-2.5 border-t border-hub-border-card/60 pt-3"
            >
                {actionArray.map((item) => {
                    if (!item) return null;

                    if (item.key === 'delete') {
                        return (
                            <CustomPopconfirm
                                key="delete"
                                okText="Xác nhận"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                                title="Xác nhận xóa"
                                description="Bạn có chắc chắn muốn xóa mục này không?"
                                onConfirm={async () => {
                                    const id = getRecordId(record);
                                    if (id != null && id !== '') {
                                        handleDelete?.([String(id)]);
                                        if (onDeleteSuccess) await onDeleteSuccess();
                                        await tableQuery?.refetch();
                                    }
                                }}
                            >
                                <CustomButton size="small" danger icon={<DeleteOutlined />}>
                                    Xóa
                                </CustomButton>
                            </CustomPopconfirm>
                        );
                    }

                    const buttonLabel =
                        typeof item.label === 'string'
                            ? item.label
                            : item.key === 'view'
                              ? 'Xem chi tiết'
                              : item.key === 'edit'
                                ? 'Chỉnh sửa'
                                : item.label;

                    return (
                        <CustomButton
                            key={item.key}
                            size="small"
                            type="default"
                            danger={item.danger}
                            icon={item.icon}
                            onClick={(e) => {
                                e.stopPropagation();
                                item.onClick?.({ domEvent: e, key: item.key });
                            }}
                        >
                            {buttonLabel}
                        </CustomButton>
                    );
                })}
            </CustomFlex>
        );
    };

    const renderCardContent = (record: RecordType, index: number) => {
        const validColumns = (columns || []).filter((colItem) => {
            const col = colItem as ColumnType<RecordType>;
            return col.dataIndex !== 'actions' && col.key !== 'actions';
        });

        if (!validColumns.length) return null;

        const firstCol = validColumns[0] as ColumnType<RecordType>;
        const remainingCols = validColumns.slice(1);

        let firstValue: unknown = firstCol.dataIndex ? get(record, firstCol.dataIndex) : undefined;
        if (firstCol.render) {
            firstValue = firstCol.render(firstValue, record, index);
        }

        return (
            <CustomFlex vertical gap={10} className="w-full">
                {/* Mobile Card Header */}
                <CustomFlex
                    align="center"
                    justify="space-between"
                    className="border-b border-hub-border-card/60 pb-2.5"
                >
                    <Text className="text-base font-semibold text-hub-title overflow-hidden text-ellipsis whitespace-nowrap">
                        {firstValue as ReactNode}
                    </Text>
                </CustomFlex>

                {/* Mobile Card Body Key-Values */}
                <CustomFlex vertical gap={8} className="pt-1">
                    {remainingCols.map((colItem, colIndex) => {
                        const col = colItem as ColumnType<RecordType>;

                        let value: unknown = col.dataIndex ? get(record, col.dataIndex) : undefined;
                        if (col.render) {
                            value = col.render(value, record, index);
                        }

                        if (isNil(value) || value === '') return null;

                        return (
                            <CustomFlex
                                gap={16}
                                justify="space-between"
                                align="center"
                                key={col.key ?? (col.dataIndex as string | number) ?? colIndex}
                                className="border-b border-hub-border-card/40 pb-2 last:border-0 last:pb-0"
                            >
                                <Text className="text-xs font-medium text-hub-muted flex-shrink-0 pr-2">
                                    {col.title as ReactNode}
                                </Text>
                                <Text className="text-sm font-medium text-hub-text text-right break-words overflow-hidden">
                                    {value as ReactNode}
                                </Text>
                            </CustomFlex>
                        );
                    })}
                </CustomFlex>
            </CustomFlex>
        );
    };

    return (
        <CustomFlex vertical gap={12} className="w-full">
            {dataSource?.map((record, index) => {
                const actions = getCustomActionItems(record);
                const recordId = getRecordId(record, index);

                if (renderMobileCard) {
                    return (
                        <CustomFlex key={recordId} className="w-full">
                            {renderMobileCard(record, actions)}
                        </CustomFlex>
                    );
                }

                return (
                    <CustomCard
                        key={recordId}
                        className="w-full !rounded-xl !border-hub-border-card shadow-xs"
                        paddingSize="sm"
                    >
                        {renderCardContent(record, index)}
                        {renderActions(record, actions)}
                    </CustomCard>
                );
            })}
        </CustomFlex>
    );
}
