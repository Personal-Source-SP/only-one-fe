'use client';

import { HUB_ANTD_PICKER_CLASS, mergeHubAntdClass } from '@/components/custom-antd';
import { DatePicker, type DatePickerProps } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';

export type CustomPickerProps = DatePickerProps;

export type CustomRangePickerProps = RangePickerProps;

export const CustomPicker = Object.assign(
    ({ className, ...props }: CustomPickerProps) => (
        <DatePicker {...props} className={mergeHubAntdClass(HUB_ANTD_PICKER_CLASS, className)} />
    ),
    {
        RangePicker: ({ className, ...props }: CustomRangePickerProps) => (
            <DatePicker.RangePicker
                {...props}
                className={mergeHubAntdClass(HUB_ANTD_PICKER_CLASS, className)}
            />
        ),
    },
);
