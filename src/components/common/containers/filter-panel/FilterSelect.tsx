'use client';

import { CustomSelect } from '@/components/custom-antd';
import { useCallback } from 'react';
import type { FilterValue, IFilterField } from './index';

interface FilterSelectProps {
    field: IFilterField;
    onChange: (field: IFilterField, value: FilterValue) => void;
}

export const FilterSelect = ({ field, onChange }: FilterSelectProps) => {
    const handleChange = useCallback(
        (value: FilterValue) => {
            onChange(field, value);
        },
        [field, onChange],
    );

    return (
        <CustomSelect
            allowClear
            value={field.value}
            options={field.options}
            onChange={handleChange}
            id={`filter-${field.name}`}
            className={`w-full sm:min-w-44 sm:w-auto ${field.className ?? ''}`.trim()}
            placeholder={typeof field.placeholder === 'string' ? field.placeholder : undefined}
            {...field.selectProps}
        />
    );
};
