'use client';

import type { CustomPicker, InputProps, SegmentedProps, SelectProps } from '@/components/custom';
import type { Dayjs } from 'dayjs';
import type { ComponentProps, ReactNode } from 'react';
import { useCallback } from 'react';

import { FilterDateRange } from './FilterDateRange';
import { FilterInput } from './FilterInput';
import { FilterSegmented } from './FilterSegmented';
import { FilterSelect } from './FilterSelect';

export type FilterValue =
    | string
    | number
    | boolean
    | string[]
    | number[]
    | [Dayjs, Dayjs]
    | null
    | undefined;

export interface FilterOption {
    label: ReactNode;
    value: string | number | null | undefined;
}

export interface IFilterField {
    /** Filter field name (identifier) */
    name: string;

    /** Placeholder text */
    placeholder?: string | [string, string];

    /** Filter control type */
    type: 'input' | 'select' | 'dateRange' | 'segmented';

    /** Current value */
    value?: FilterValue;

    /** Visible label above control */
    label?: ReactNode;

    /** Callback when the value changes */
    onChange?: (value: FilterValue) => void;

    /** Option list for the select box */
    options?: FilterOption[];

    /** Custom CSS class for this filter field */
    className?: string;

    /** Deep custom props for Ant Design Select */
    selectProps?: SelectProps;

    /** Deep custom props for Ant Design Input */
    inputProps?: InputProps;

    /** Deep custom props for Ant Design RangePicker */
    rangePickerProps?: ComponentProps<typeof CustomPicker.RangePicker>;

    /** Enable default quick date range presets */
    enableDateRangePresets?: boolean;

    /** Deep custom props for Ant Design Segmented */
    segmentedProps?: SegmentedProps;
}

export interface FilterPanelProps {
    /** Filter field configuration array */
    fields: IFilterField[];

    /** Custom CSS class for the filter container */
    className?: string;
}

export const FilterPanel = ({ fields, className = '' }: FilterPanelProps) => {
    const handleFieldChange = useCallback((field: IFilterField, value: FilterValue) => {
        field.onChange?.(value);
    }, []);

    return (
        <div className={`flex flex-wrap items-center gap-2 w-full ${className}`.trim()}>
            {fields.map((field) => (
                <section key={field.name} className="flex min-w-0 flex-col gap-1.5">
                    {field.label ? (
                        <label
                            className="text-sm font-medium text-gray-700 dark:text-gray-300"
                            htmlFor={`filter-${field.name}`}
                        >
                            {field.label}
                        </label>
                    ) : null}
                    {(() => {
                        switch (field.type) {
                            case 'input':
                                return <FilterInput field={field} onChange={handleFieldChange} />;
                            case 'select':
                                return <FilterSelect field={field} onChange={handleFieldChange} />;
                            case 'dateRange':
                                return (
                                    <FilterDateRange field={field} onChange={handleFieldChange} />
                                );
                            case 'segmented':
                                return (
                                    <FilterSegmented field={field} onChange={handleFieldChange} />
                                );
                            default:
                                return null;
                        }
                    })()}
                </section>
            ))}
        </div>
    );
};
