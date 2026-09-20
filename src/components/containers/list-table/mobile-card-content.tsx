'use client';

import { type ReactNode, useCallback, useMemo } from 'react';
import type { BaseRecord } from '@refinedev/core';
import { isNil } from 'lodash';

import type { ColumnsType, ColumnType } from '@/components';
import { CustomFlex, CustomTypography } from '@/components';

import { getColumnValue } from './utils';

const { Text } = CustomTypography;

export interface MobileCardContentProps<RecordType extends BaseRecord> {
    index: number;
    record: RecordType;
    columns?: ColumnsType<RecordType>;
}

export function MobileCardContent<RecordType extends BaseRecord>({
    index,
    record,
    columns,
}: MobileCardContentProps<RecordType>) {
    const validColumns = useMemo(() => {
        return (columns || []).filter((colItem) => {
            const col = colItem as ColumnType<RecordType>;
            return col.dataIndex !== 'actions' && col.key !== 'actions';
        });
    }, [columns]);

    const renderColItem = useCallback(
        (colItem: ColumnType<RecordType>, colIndex: number) => {
            const col = colItem as ColumnType<RecordType>;
            const value = getColumnValue(col, record, index);

            if (isNil(value) || value === '') return null;

            if (colIndex === 0) {
                return (
                    <CustomFlex
                        vertical
                        gap={2}
                        className="border-b border-hub-border-card/60 pb-2.5"
                        key={col.key ?? (col.dataIndex as string | number) ?? colIndex}
                    >
                        {col.title && (
                            <Text className="text-xs font-medium text-hub-muted">
                                {col.title as ReactNode}
                            </Text>
                        )}
                        <Text className="text-base font-semibold text-hub-title overflow-hidden text-ellipsis whitespace-nowrap">
                            {value as ReactNode}
                        </Text>
                    </CustomFlex>
                );
            }

            return (
                <CustomFlex
                    gap={16}
                    align="center"
                    justify="space-between"
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
        },
        [record, index],
    );

    if (!validColumns.length) return null;

    return (
        <CustomFlex vertical gap={8} className="w-full">
            {validColumns.map(renderColItem)}
        </CustomFlex>
    );
}
