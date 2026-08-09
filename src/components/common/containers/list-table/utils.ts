import type { BaseRecord } from '@refinedev/core';
import { get } from 'lodash';

/**
 * Lấy ID định danh duy nhất của bản ghi (hỗ trợ cả SQL `id` và MongoDB `_id`).
 * Nếu không có, sẽ tự động dùng `fallbackIndex` nếu được truyền vào.
 */
export const getRecordId = (record: BaseRecord, fallbackIndex?: number): string | number => {
    return (get(record, 'id') ?? get(record, '_id') ?? fallbackIndex) as string | number;
};
