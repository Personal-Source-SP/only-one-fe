'use client';

import { CustomPicker } from '@/components/custom-antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useCallback, useMemo } from 'react';
import type { FilterValue, IFilterField } from './index';

interface FilterDateRangeProps {
    field: IFilterField;
    onChange: (field: IFilterField, value: FilterValue) => void;
}

export const FilterDateRange = ({ field, onChange }: FilterDateRangeProps) => {
    const handleChange = useCallback(
        (dates: [Dayjs | null, Dayjs | null] | null) => {
            if (!dates || !dates[0] || !dates[1]) {
                onChange(field, null);
            } else {
                onChange(field, [dates[0], dates[1]]);
            }
        },
        [field, onChange],
    );

    const defaultPresets = useMemo(() => {
        if (!field.enableDateRangePresets) return undefined;
        return [
            {
                label: 'Hôm nay',
                value: [dayjs().startOf('day'), dayjs().endOf('day')] as [Dayjs, Dayjs],
            },
            {
                label: '7 ngày qua',
                value: [dayjs().subtract(7, 'day').startOf('day'), dayjs().endOf('day')] as [
                    Dayjs,
                    Dayjs,
                ],
            },
            {
                label: 'Tháng này',
                value: [dayjs().startOf('month'), dayjs().endOf('month')] as [Dayjs, Dayjs],
            },
        ];
    }, [field.enableDateRangePresets]);

    return (
        <CustomPicker.RangePicker
            id={`filter-${field.name}`}
            allowClear
            value={field.value as [Dayjs, Dayjs] | null}
            presets={field.rangePickerProps?.presets ?? defaultPresets}
            placeholder={
                Array.isArray(field.placeholder) ? field.placeholder : ['Từ ngày', 'Đến ngày']
            }
            onChange={handleChange as any}
            className={`w-64 ${field.className ?? ''}`.trim()}
            {...field.rangePickerProps}
        />
    );
};
