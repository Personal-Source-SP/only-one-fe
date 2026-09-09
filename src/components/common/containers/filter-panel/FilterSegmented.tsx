'use client';

import { CustomSegmented } from '@/components/custom-antd';
import { useCallback } from 'react';
import type { FilterValue, IFilterField } from './index';

interface FilterSegmentedProps {
    field: IFilterField;
    onChange: (field: IFilterField, value: FilterValue) => void;
}

export const FilterSegmented = ({ field, onChange }: FilterSegmentedProps) => {
    const handleChange = useCallback(
        (value: FilterValue) => {
            onChange(field, value);
        },
        [field, onChange],
    );

    const validOptions = (field.options || [])
        .filter((opt) => opt.value !== null && opt.value !== undefined)
        .map((opt) => ({
            label: opt.label,
            value: opt.value as string | number,
        }));

    return (
        <CustomSegmented
            options={validOptions}
            onChange={handleChange}
            id={`filter-${field.name}`}
            value={field.value as string | number}
            className={`w-full sm:w-auto max-w-full overflow-x-auto ${field.className ?? ''}`.trim()}
            {...field.segmentedProps}
        />
    );
};
