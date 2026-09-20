'use client';

import { useCallback } from 'react';

import { CustomSegmented } from '@/components';

import type { IFilterField, IFilterValue } from './types';

interface FilterSegmentedProps {
    field: IFilterField;
    onChange: (field: IFilterField, value: IFilterValue) => void;
}

export const FilterSegmented = ({ field, onChange }: FilterSegmentedProps) => {
    const handleChange = useCallback(
        (value: IFilterValue) => {
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
