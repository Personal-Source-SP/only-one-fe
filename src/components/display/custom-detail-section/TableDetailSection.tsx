'use client';

import { CustomCard, CustomTable } from '@/components';
import get from 'lodash/get';
import { useMemo } from 'react';
import type { ITableDetailSection } from './types';

export type TableDetailSectionProps<TRecord extends object = Record<string, unknown>> = {
    section: ITableDetailSection<TRecord>;
    record: TRecord;
};

export const TableDetailSection = <TRecord extends object = Record<string, unknown>>({
    section,
    record,
}: TableDetailSectionProps<TRecord>) => {
    const {
        title,
        columns,
        dataSource,
        rowKey = 'id',
        size = 'small',
        bordered = true,
        pagination = false,
        className = '',
        tableProps,
    } = section;

    const tableData = useMemo(() => {
        if (typeof dataSource === 'function') {
            return dataSource(record);
        }
        if (typeof dataSource === 'string') {
            return get(record, dataSource, []) as unknown[];
        }
        return [];
    }, [dataSource, record]);

    const mergedTableProps = useMemo(
        () => ({
            size,
            bordered,
            columns,
            dataSource: tableData,
            rowKey: rowKey as any,
            pagination,
            className: `w-full ${className}`.trim(),
            ...tableProps,
        }),
        [size, bordered, columns, tableData, rowKey, pagination, className, tableProps],
    );

    const tableNode = (
        <CustomTable loading={false} columns={columns} tableProps={mergedTableProps} />
    );

    if (title) {
        return (
            <CustomCard size="small" title={title} className="w-full">
                {tableNode}
            </CustomCard>
        );
    }

    return tableNode;
};
