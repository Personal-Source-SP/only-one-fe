import type { ColumnType } from '@/components/custom-antd';
import type { BaseRecord } from '@refinedev/core';
import { get } from 'lodash';

/**
 * Lấy ID định danh duy nhất của bản ghi (hỗ trợ cả SQL `id` và MongoDB `_id`).
 * Nếu không có, sẽ tự động dùng `fallbackIndex` nếu được truyền vào.
 */
export const getRecordId = (record: BaseRecord, fallbackIndex?: number): string | number => {
    return (get(record, 'id') ?? get(record, '_id') ?? fallbackIndex) as string | number;
};

/**
 * Trích xuất và render giá trị hiển thị từ cấu hình column và record.
 */
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
