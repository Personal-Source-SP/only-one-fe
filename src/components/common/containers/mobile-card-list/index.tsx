'use client';

import type { useTableReturnType } from '@refinedev/antd';
import type { BaseKey, BaseRecord } from '@refinedev/core';
import type { ReactNode } from 'react';

import type { ColumnsType, MenuProps } from '@/components/custom-antd';
import { CustomFlex } from '@/components/custom-antd';
import { MobileCardItem } from './mobile-card-item';
import { getRecordId } from './utils';

export interface MobileCardListProps<RecordType extends BaseRecord> {
    dataSource: readonly RecordType[] | undefined;
    columns?: ColumnsType<RecordType>;
    tableQuery?: useTableReturnType<RecordType>['tableQuery'];
    getCustomActionItems: (record: RecordType) => MenuProps['items'];
    handleDelete?: (id: BaseKey) => void;
    onDeleteSuccess?: () => void | Promise<void>;
    renderMobileCard?: (record: RecordType, actionItems: MenuProps['items']) => ReactNode;
}

export function MobileCardList<RecordType extends BaseRecord>({
    dataSource,
    columns,
    tableQuery,
    getCustomActionItems,
    renderMobileCard,
    handleDelete,
    onDeleteSuccess,
}: MobileCardListProps<RecordType>) {
    return (
        <CustomFlex vertical gap={12} className="w-full">
            {dataSource?.map((record, index) => (
                <MobileCardItem
                    record={record}
                    index={index}
                    columns={columns}
                    tableQuery={tableQuery}
                    key={getRecordId(record, index)}
                    handleDelete={handleDelete}
                    onDeleteSuccess={onDeleteSuccess}
                    renderMobileCard={renderMobileCard}
                    getCustomActionItems={getCustomActionItems}
                />
            ))}
        </CustomFlex>
    );
}
