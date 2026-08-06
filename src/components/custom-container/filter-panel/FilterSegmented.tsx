'use client';

import { CustomSegmented } from '@/components/custom';
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
            id={`filter-${field.name}`}
            value={field.value as string | number}
            options={validOptions}
            onChange={handleChange}
            className={`${field.className ?? ''}`.trim()}
            {...field.segmentedProps}
        />
    );
};
