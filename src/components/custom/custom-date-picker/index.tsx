'use client';

import { DATE_FORMAT_SHORT, DATE_FORMAT_TIME } from '@/constants';
import { DatePicker, Form } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { debounce } from 'lodash';
import { FC, useCallback } from 'react';

const { RangePicker } = DatePicker;

type CustomDatePickerProps = {
    name: string;
    label: string;
    setDateRange: (dateRange: [string, string]) => void;
    showTime?: boolean;
    allowClear?: boolean;
    dateRange?: [string, string];
};

const CustomDatePicker: FC<CustomDatePickerProps> = ({
    name,
    label,
    setDateRange,
    showTime,
    allowClear,
    dateRange,
}) => {
    const presets: any[] = [
        {
            label: 'Hôm qua',
            value: [dayjs().add(-1, 'd').startOf('d'), dayjs().add(-1, 'd').endOf('d')],
        },
        {
            label: 'Hôm nay',
            value: [dayjs().startOf('d'), dayjs().endOf('d')],
        },
        {
            label: '7 ngày qua',
            value: [dayjs().add(-7, 'd').startOf('d'), dayjs().endOf('d')],
        },
        {
            label: '14 ngày qua',
            value: [dayjs().add(-14, 'd').startOf('d'), dayjs().endOf('d')],
        },
        {
            label: '30 ngày qua',
            value: [dayjs().add(-29, 'd').startOf('d'), dayjs().endOf('d')],
        },
        {
            label: 'Tuần này',
            value: [dayjs().startOf('week'), dayjs().endOf('d')],
        },
        {
            label: 'Tháng này',
            value: [dayjs().startOf('month'), dayjs().endOf('d')],
        },
        {
            label: 'Năm này',
            value: [dayjs().startOf('year'), dayjs().endOf('d')],
        },
    ];

    const setDateRangeValue = useCallback(
        debounce(
            (range: [string, string]) => {
                const format = showTime ? DATE_FORMAT_TIME : DATE_FORMAT_SHORT;

                const startDate = dayjs(range[0], format);
                const endDate = dayjs(range[1], format);

                if (showTime) {
                    setDateRange([startDate.toISOString(), endDate.toISOString()]);
                } else {
                    setDateRange([
                        startDate.startOf('d').toISOString(),
                        endDate.endOf('d').toISOString(),
                    ]);
                }
            },
            500,
            { leading: true },
        ),
        [showTime],
    );

    return (
        <Form.Item label={label} name={name}>
            <RangePicker
                presets={presets}
                showTime={showTime}
                allowClear={allowClear}
                className="h-[42px] select-range-date"
                format={showTime ? DATE_FORMAT_TIME : DATE_FORMAT_SHORT}
                value={dateRange && [dayjs(dateRange[0]), dayjs(dateRange[1])]}
                defaultValue={dateRange && [dayjs(dateRange[0]), dayjs(dateRange[1])]}
                disabledDate={(date) => (date ? date.isAfter(dayjs(), 'day') : false)}
                onChange={(dates: null | (Dayjs | null)[], dateString: [string, string]) => {
                    if (dates && dates[0] && dates[1]) {
                        setDateRangeValue(dateString);
                    }
                }}
            />
        </Form.Item>
    );
};

export default CustomDatePicker;
