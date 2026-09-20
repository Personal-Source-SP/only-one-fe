'use client';

import { CustomCard, CustomDataTable } from '@/components/custom-antd';
import type { ITableDetailSection } from '@/interfaces';
import get from 'lodash/get';
import { useMemo } from 'react';

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
            return get(record, dataSource, []) as Record<string, unknown>[];
        }
        return [];
    }, [dataSource, record]);

    const tableNode = (
        <CustomDataTable<Record<string, unknown>>
            size={size}
            bordered={bordered}
            columns={columns}
            dataSource={tableData}
            rowKey={rowKey as string}
            pagination={pagination}
            className={`w-full ${className}`.trim()}
            {...tableProps}
        />
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
