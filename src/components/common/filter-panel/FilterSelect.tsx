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
            id={`filter-${field.name}`}
            allowClear
            value={field.value}
            options={field.options}
            placeholder={typeof field.placeholder === 'string' ? field.placeholder : undefined}
            onChange={handleChange}
            className={`min-w-44 ${field.className ?? ''}`.trim()}
            {...field.selectProps}
        />
    );
};
