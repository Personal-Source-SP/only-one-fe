import type { ColumnType } from '@/components';
import type { BaseRecord } from '@refinedev/core';
import { get } from 'lodash';

export const getRecordId = <RecordType extends BaseRecord>(
    record: RecordType,
    index?: number,
): string => {
    if (record?.id != null && record.id !== '') {
        return String(record.id);
    }

    if (record?._id != null && record._id !== '') {
        return String(record._id);
    }

    if (record?.key != null && record.key !== '') {
        return String(record.key);
    }

    return `record-${index ?? Math.random().toString(36).substring(2, 9)}`;
};

export const getColumnValue = <RecordType extends BaseRecord>(
    col: ColumnType<RecordType> | undefined,
    record: RecordType,
    index: number,
): unknown => {
    let value: unknown = col?.dataIndex ? get(record, col.dataIndex) : undefined;
    if (col?.render) {
        value = col.render(value, record, index);
    }
    return value;
};
