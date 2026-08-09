'use client';

import { CustomInput } from '@/components/custom-antd';
import React, { useCallback, useEffect, useState } from 'react';
import type { FilterValue, IFilterField } from './index';

interface FilterInputProps {
    field: IFilterField;
    onChange: (field: IFilterField, value: FilterValue) => void;
}

export const FilterInput = ({ field, onChange }: FilterInputProps) => {
    const [innerValue, setInnerValue] = useState<string>((field.value as string) ?? '');

    useEffect(() => {
        setInnerValue((field.value as string) ?? '');
    }, [field.value]);

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
            allowClear
            value={innerValue}
            onChange={handleChange}
            id={`filter-${field.name}`}
            className={`w-full sm:w-48 lg:w-64 ${field.className ?? ''}`.trim()}
            placeholder={typeof field.placeholder === 'string' ? field.placeholder : undefined}
            {...field.inputProps}
        />
    );
};
