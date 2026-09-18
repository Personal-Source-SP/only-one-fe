'use client';

import { DeleteOutlined } from '@ant-design/icons';
import type { useTableReturnType } from '@refinedev/antd';
import type { BaseKey, BaseRecord } from '@refinedev/core';
import { isEmpty } from 'lodash';
import { useCallback, type Key, type MouseEvent, type ReactNode } from 'react';

import type { MenuProps } from '@/components/custom-antd';
import { CustomButton, CustomPopconfirm } from '@/components/custom-antd';
import type { ActionMenuItem } from '@/interfaces';
import { getRecordId } from './utils';

export type { ActionMenuItem };

export interface MobileCardActionsProps<RecordType extends BaseRecord> {
    record: RecordType;
    actions: MenuProps['items'];
    tableQuery?: useTableReturnType<RecordType>['tableQuery'];
    handleDelete?: (id: BaseKey) => void;
    onDeleteSuccess?: () => void | Promise<void>;
}

export function MobileCardActions<RecordType extends BaseRecord>({
    record,
    actions,
    tableQuery,
    handleDelete,
    onDeleteSuccess,
}: MobileCardActionsProps<RecordType>) {
    if (!actions || isEmpty(actions)) return null;

    const getActionButtonLabel = useCallback((item: ActionMenuItem) => {
        if (typeof item.label === 'string') return item.label;
        if (item.key === 'view') return 'Xem chi tiết';
        if (item.key === 'edit') return 'Chỉnh sửa';
        return item.label;
    }, []);

    const renderActionItem = useCallback((item: ActionMenuItem) => {
        if (!item) return null;

        if (item.key === 'delete') {
            return (
                <CustomPopconfirm
                    key="delete"
                    okText="Xác nhận"
                    cancelText="Hủy"
                    title="Xác nhận xóa"
                    okButtonProps={{ danger: true }}
                    description="Bạn có chắc chắn muốn xóa mục này không?"
                    onConfirm={async () => {
                        const id = getRecordId(record);
                        if (id != null && id !== '') {
                            handleDelete?.(id);
                            if (onDeleteSuccess) await onDeleteSuccess();
                            await tableQuery?.refetch();
                        }
                    }}
                >
                    <CustomButton
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        className="w-full justify-center"
                    >
                        Xóa
                    </CustomButton>
                </CustomPopconfirm>
            );
        }

        return (
            <CustomButton
                size="small"
                type="default"
                key={item.key}
                icon={item.icon}
                danger={item.danger}
                className="w-full justify-center text-xs"
                onClick={(e) => {
                    e.stopPropagation();
                    item.onClick?.({ domEvent: e, key: item.key });
                }}
            >
                <span className="truncate">{getActionButtonLabel(item)}</span>
            </CustomButton>
        );
    }, []);

    return (
        <div className="mt-2.5 border-t border-hub-border-card/60 pt-3 grid grid-cols-2 gap-2 w-full [&>:last-child:nth-child(odd)]:col-span-2">
            {actions.map((item) => renderActionItem(item as ActionMenuItem))}
        </div>
    );
}
