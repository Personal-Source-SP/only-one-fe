'use client';

import { DatePicker, DatePickerProps } from 'antd';

export type CustomPickerProps = DatePickerProps;

export const CustomPicker = Object.assign((props: CustomPickerProps) => <DatePicker {...props} />, {
    RangePicker: DatePicker.RangePicker,
});
