'use client';

import { useCallback, useMemo, useState } from 'react';
import { FilterOutlined } from '@ant-design/icons';

import { CustomBadge, CustomButton, CustomModal } from '@/components';

import { FilterDateRange } from './FilterDateRange';
import { FilterInput } from './FilterInput';
import { FilterSegmented } from './FilterSegmented';
import { FilterSelect } from './FilterSelect';
import type { FilterPanelProps, IFilterField, IFilterValue } from './types';

export const FilterPanel = ({
    fields,
    className = '',
    mobileModalTitle,
    mobileDrawerTitle,
    enableMobileModal,
    enableMobileDrawer,
    extraActions,
    onResetFilters,
}: FilterPanelProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const primaryFields = useMemo(() => fields.filter((f) => f.isPrimary), [fields]);
    const secondaryFields = useMemo(() => fields.filter((f) => !f.isPrimary), [fields]);
    const hasSecondaryFilters = useMemo(() => secondaryFields.length > 0, [secondaryFields]);

    const showFilterButton = useMemo(
        () => hasSecondaryFilters || primaryFields.length === 0,
        [hasSecondaryFilters, primaryFields.length],
    );

    const modalFields = useMemo(
        () => (primaryFields.length > 0 ? secondaryFields : fields),
        [primaryFields.length, secondaryFields, fields],
    );

    const isMobileModalActive = useMemo(() => {
        const isEnabled = enableMobileModal ?? enableMobileDrawer;
        if (isEnabled === false) return false;
        return modalFields.length > 0;
    }, [enableMobileModal, enableMobileDrawer, modalFields.length]);

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

    const handleFieldChange = useCallback((field: IFilterField, value: IFilterValue) => {
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

            {/* Mobile Layout (< md): Row 1 primary fields (w-full) + Row 2 controls bar */}
            <div className="flex md:hidden flex-col gap-2.5 w-full">
                {primaryFields.length > 0 && (
                    <div className="flex flex-col gap-2 w-full">
                        {primaryFields.map((field) => (
                            <div key={field.name} className="w-full min-w-0">
                                {renderFilterControl(field)}
                            </div>
                        ))}
                    </div>
                )}

                {(showFilterButton || extraActions) && (
                    <div className="flex items-center justify-between gap-2 w-full">
                        <div className="flex items-center gap-2 shrink-0">
                            {showFilterButton && (
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
                            )}
                        </div>

                        {extraActions && <div className="shrink-0 ml-auto">{extraActions}</div>}
                    </div>
                )}
            </div>

            {/* Mobile Filter Modal */}
            {isMobileModalActive && (
                <CustomModal
                    closable
                    width={520}
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
                >
                    <div className="flex flex-col gap-2.5 px-3 py-2">
                        {modalFields.map((field) => {
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
