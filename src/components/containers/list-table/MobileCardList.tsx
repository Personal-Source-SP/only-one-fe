'use client';

import type { BaseRecord } from '@refinedev/core';

import { CustomFlex } from '@/components';
import { MobileCardItem } from './mobile-card-item';
import type { MobileCardListProps } from './types';
import { getRecordId } from './utils';

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
