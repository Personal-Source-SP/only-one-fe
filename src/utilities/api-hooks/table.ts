import type { BaseRecord } from '@refinedev/core';

export const resolveRowKey = <TRecord extends BaseRecord>(
    record: TRecord,
    rowKey?: keyof TRecord | ((record: TRecord) => string),
): string => {
    if (typeof rowKey === 'function') {
        return rowKey(record);
    }
    if (rowKey) {
        return String(record[rowKey]);
    }
    const rec = record as Record<string, unknown>;
    if (rec.id !== undefined && rec.id !== null) {
        return String(rec.id);
    }
    if (rec._id !== undefined && rec._id !== null) {
        return String(rec._id);
    }
    return '';
};
