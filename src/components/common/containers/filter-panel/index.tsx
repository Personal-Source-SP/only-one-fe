'use client';

import { FilterOutlined } from '@ant-design/icons';
import {
    CustomBadge,
    CustomButton,
    CustomModal,
    type CustomPicker,
    type InputProps,
    type SegmentedProps,
    type SelectProps,
} from '@/components/custom-antd';
import type { Dayjs } from 'dayjs';
import type { ComponentProps, ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';

import { FilterDateRange } from './FilterDateRange';
import { FilterInput } from './FilterInput';
import { FilterSegmented } from './FilterSegmented';
import { FilterSelect } from './FilterSelect';

export type FilterValue =
    string | number | boolean | string[] | number[] | [Dayjs, Dayjs] | null | undefined;

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

    /** Force field to stay inline as primary filter on mobile */
    isPrimary?: boolean;
}

export interface FilterPanelProps {
    /** Filter field configuration array */
    fields: IFilterField[];

    /** Custom CSS class for the filter container */
    className?: string;

    /** Custom title for mobile modal */
    mobileModalTitle?: ReactNode;

    /** Legacy alias for mobileModalTitle */
    mobileDrawerTitle?: ReactNode;

    /** Enable mobile modal for secondary filters (default: true if fields > 1) */
    enableMobileModal?: boolean;

    /** Legacy alias for enableMobileModal */
    enableMobileDrawer?: boolean;

    /** Optional callback when resetting filters in modal */
    onResetFilters?: () => void;
}

export const FilterPanel = ({
    fields,
    className = '',
    mobileModalTitle,
    mobileDrawerTitle,
    enableMobileModal,
    enableMobileDrawer,
    onResetFilters,
}: FilterPanelProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isMobileModalActive = useMemo(() => {
        const isEnabled = enableMobileModal ?? enableMobileDrawer;
        if (isEnabled === false) return false;
        return fields.length > 0;
    }, [enableMobileModal, enableMobileDrawer, fields.length]);

    const activeCount = useMemo(() => {
        return fields.reduce((count, field) => {
            const val = field.value;
            if (val !== undefined && val !== null && val !== '') {
                if (Array.isArray(val) && val.length === 0) return count;
                return count + 1;
            }
            return count;
        }, 0);
    }, [fields]);

    const handleFieldChange = useCallback((field: IFilterField, value: FilterValue) => {
        field.onChange?.(value);
    }, []);

    const handleResetAll = useCallback(() => {
        fields.forEach((field) => {
            field.onChange?.(null);
        });
        onResetFilters?.();
    }, [fields, onResetFilters]);

    const renderFilterControl = useCallback(
        (field: IFilterField) => {
            switch (field.type) {
                case 'input':
                    return <FilterInput field={field} onChange={handleFieldChange} />;
                case 'select':
                    return <FilterSelect field={field} onChange={handleFieldChange} />;
                case 'dateRange':
                    return <FilterDateRange field={field} onChange={handleFieldChange} />;
                case 'segmented':
                    return <FilterSegmented field={field} onChange={handleFieldChange} />;
                default:
                    return null;
            }
        },
        [handleFieldChange],
    );

    if (!fields?.length) return null;

    return (
        <div className={`w-full ${className}`.trim()}>
            {/* Desktop Layout (md and above): Render all fields inline */}
            <div className="hidden md:flex md:flex-wrap md:items-center gap-2 w-full">
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
                        {renderFilterControl(field)}
                    </section>
                ))}
            </div>

            {/* Mobile Layout (< md): Single "Lọc" button containing all filters in Modal */}
            <div className="flex md:hidden items-center justify-end gap-2">
                <CustomButton
                    className="shrink-0"
                    ghost={activeCount > 0}
                    icon={<FilterOutlined />}
                    onClick={() => setIsModalOpen(true)}
                    type={activeCount > 0 ? 'primary' : 'default'}
                >
                    <span className="text-xs font-medium">Lọc</span>
                    {activeCount > 0 && (
                        <CustomBadge
                            className="ml-1"
                            overflowCount={99}
                            count={activeCount}
                            style={{ backgroundColor: 'var(--hub-primary)' }}
                        />
                    )}
                </CustomButton>
            </div>

            {/* Mobile Filter Modal */}
            {isMobileModalActive && (
                <CustomModal
                    closable
                    maskClosable
                    open={isModalOpen}
                    onCancel={() => setIsModalOpen(false)}
                    wrapClassName="[&_.ant-modal-content]:!p-3 [&_.ant-modal-header]:!py-1.5 [&_.ant-modal-header]:!px-1 [&_.ant-modal-footer]:!py-1.5 [&_.ant-modal-footer]:!px-1 [&_.ant-modal-footer]:!mt-2"
                    title={
                        <span className="font-semibold text-sm text-hub-title">
                            {mobileModalTitle ?? mobileDrawerTitle ?? 'Bộ lọc dữ liệu'}
                        </span>
                    }
                    footer={
                        <div className="flex items-center justify-between gap-2.5 w-full">
                            <CustomButton
                                danger
                                size="small"
                                type="default"
                                onClick={handleResetAll}
                            >
                                Đặt lại
                            </CustomButton>
                            <CustomButton
                                size="small"
                                type="primary"
                                className="flex-1"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Áp dụng {activeCount > 0 ? `(${activeCount})` : ''}
                            </CustomButton>
                        </div>
                    }
                    width={520}
                >
                    <div className="flex flex-col gap-2.5 px-3 py-2">
                        {fields.map((field) => {
                            const fieldLabel =
                                field.label ??
                                (typeof field.placeholder === 'string' ? field.placeholder : null);

                            return (
                                <section key={field.name} className="flex flex-col gap-1 w-full">
                                    {fieldLabel && (
                                        <label
                                            className="text-xs font-medium text-gray-700 dark:text-gray-300"
                                            htmlFor={`filter-modal-${field.name}`}
                                        >
                                            {fieldLabel}
                                        </label>
                                    )}
                                    {renderFilterControl(field)}
                                </section>
                            );
                        })}
                    </div>
                </CustomModal>
            )}
        </div>
    );
};
