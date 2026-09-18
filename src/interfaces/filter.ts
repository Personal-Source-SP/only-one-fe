import type {
    CustomPicker,
    InputProps,
    SegmentedProps,
    SelectProps,
} from '@/components/custom-antd';
import { CustomFilterType } from '@/enums';
import { CrudOperators } from '@refinedev/core';
import type { Dayjs } from 'dayjs';
import type { ComponentProps, ReactNode } from 'react';
import type { IOption } from './component';

// --- Standard Filter Contracts ---
export type FilterValue =
    string | number | boolean | string[] | number[] | [Dayjs, Dayjs] | null | undefined;

export type FilterType = 'input' | 'select' | 'dateRange' | 'segmented';

export type IFilterOption = IOption<string | number | null | undefined, ReactNode>;

export interface IFilterField {
    name: string;
    type: FilterType;
    label?: ReactNode;
    value?: FilterValue;
    className?: string;
    isPrimary?: boolean;
    enableDateRangePresets?: boolean;
    placeholder?: string | [string, string];
    onChange?: (value: FilterValue) => void;

    options?: IFilterOption[];
    inputProps?: InputProps;
    selectProps?: SelectProps;
    segmentedProps?: SegmentedProps;
    rangePickerProps?: ComponentProps<typeof CustomPicker.RangePicker>;
}

// --- Legacy Filter Contracts ---
export interface IFilterItem {
    span: number;
    type: CustomFilterType;

    value?: unknown;
    field?: string;
    title?: string;
    options?: IOption[];
    placeholder?: string;
    showSearch?: boolean;
    allowClear?: boolean;
    mode?: 'multiple' | 'tags';
    operation?: Exclude<CrudOperators, 'or' | 'and'>;

    onChange?(value: unknown): void;
}

export interface IActionTableItem {
    key: string;
    label: string;
    icon: ReactNode;
    onClick?(record: unknown): void;
}

export interface ISearchFilterItem {
    name?: string;
    span?: number;
    placeholder?: string;
}
