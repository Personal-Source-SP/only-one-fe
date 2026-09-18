'use client';

import type { useTableReturnType } from '@refinedev/antd';
import type { BaseKey, BaseRecord } from '@refinedev/core';
import type { ReactNode } from 'react';

import type { ColumnsType, MenuProps } from '@/components/custom-antd';
import { CustomCard, CustomFlex } from '@/components/custom-antd';
import { MobileCardActions } from './mobile-card-actions';
import { MobileCardContent } from './mobile-card-content';
import { getRecordId } from './utils';

export interface MobileCardItemProps<RecordType extends BaseRecord> {
    index: number;
    record: RecordType;
    columns?: ColumnsType<RecordType>;
    tableQuery?: useTableReturnType<RecordType>['tableQuery'];
    getCustomActionItems: (record: RecordType) => MenuProps['items'];
    handleDelete?: (id: BaseKey) => void;
    onDeleteSuccess?: () => void | Promise<void>;
    renderMobileCard?: (record: RecordType, actionItems: MenuProps['items']) => ReactNode;
}

export function MobileCardItem<RecordType extends BaseRecord>({
    index,
    record,
    columns,
    tableQuery,
    getCustomActionItems,
    handleDelete,
    onDeleteSuccess,
    renderMobileCard,
}: MobileCardItemProps<RecordType>) {
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
            paddingSize="sm"
            className="w-full !rounded-xl !border-hub-border-card shadow-xs"
        >
            <MobileCardContent record={record} index={index} columns={columns} />
            <MobileCardActions
                record={record}
                actions={actions}
                tableQuery={tableQuery}
                handleDelete={handleDelete}
                onDeleteSuccess={onDeleteSuccess}
            />
        </CustomCard>
    );
}
