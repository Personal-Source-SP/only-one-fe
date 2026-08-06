'use client';

import { CustomInput } from '@/components/custom';
import React, { useCallback, useState } from 'react';
import type { FilterValue, IFilterField } from './index';

interface FilterInputProps {
    field: IFilterField;
    onChange: (field: IFilterField, value: FilterValue) => void;
}

export const FilterInput = ({ field, onChange }: FilterInputProps) => {
    const [innerValue, setInnerValue] = useState<string>((field.value as string) ?? '');

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value;
            setInnerValue(val);
            onChange(field, val);
        },
        [field, onChange],
    );

    return (
        <CustomInput
            id={`filter-${field.name}`}
            allowClear
            value={innerValue}
            placeholder={typeof field.placeholder === 'string' ? field.placeholder : undefined}
            onChange={handleChange}
            className={`w-48 ${field.className ?? ''}`.trim()}
            {...field.inputProps}
        />
    );
};
