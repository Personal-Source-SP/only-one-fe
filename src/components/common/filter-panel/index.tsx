'use client';

import { CustomButton, CustomInput, CustomSelect } from '@/components/custom';
import { CustomFilterType } from '@/enums';
import { FilterItem } from '@/interfaces';
import { Icon } from '@iconify/react';
import { CrudFilter } from '@refinedev/core';
import { Col, Flex, Grid, Row } from 'antd';
import { ChangeEvent, useId } from 'react';

type FilterPanelToolbarProps = {
    filterValues?: CrudFilter[];
    hasFilters: boolean;
    isOpen: boolean;
    panelId?: string;
    onToggle: () => void;
};

export const FilterPanelToolbar = ({
    filterValues,
    hasFilters,
    isOpen,
    panelId,
    onToggle,
}: FilterPanelToolbarProps) => {
    const generatedPanelId = useId();
    const resolvedPanelId = panelId ?? generatedPanelId;
    const hasActiveFilters = Boolean(filterValues?.length);
    const toggleLabel = isOpen ? 'Thu gọn bộ lọc' : 'Bộ lọc';

    if (!hasFilters) {
        return null;
    }

    return (
        <CustomButton
            touchFriendly
            aria-controls={resolvedPanelId}
            aria-expanded={isOpen}
            aria-label={toggleLabel}
            className="rounded-lg border border-hub-border bg-hub-surface px-3 text-hub-text shadow-none hover:!border-hub-primary hover:!text-hub-primary"
            icon={<Icon className="text-hub-muted" icon="lucide:filter" />}
            type="default"
            onClick={onToggle}
        >
            {toggleLabel}
            {hasActiveFilters && (
                <span className="ml-1 min-w-5 rounded-full bg-hub-primary px-1.5 py-0.5 text-center text-[10px] text-white">
                    {filterValues?.length}
                </span>
            )}
        </CustomButton>
    );
};

type FilterPanelProps = {
    filterActions: FilterItem[];
    borderless?: boolean;
    hideToolbar?: boolean;
    isOpen: boolean;
    onToggle: () => void;
    panelId?: string;
};

const renderFilterItem = (filterItem: FilterItem, index: number, stacked: boolean) => {
    const {
        allowClear,
        mode,
        onChange,
        options,
        placeholder,
        showSearch,
        span,
        title,
        type,
        value,
    } = filterItem;

    switch (type) {
        case CustomFilterType.SEARCH: {
            return (
                <Col key={index} span={stacked ? 24 : span}>
                    <label className="mb-1 block text-sm font-semibold text-hub-muted">
                        {title || 'Tìm kiếm'}
                    </label>
                    <CustomInput
                        placeholder={placeholder ?? 'Tìm kiếm'}
                        prefix={<Icon className="text-hub-muted" icon="lucide:search" />}
                        touchFriendly={stacked}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            onChange?.(e.target.value.trim())
                        }
                    />
                </Col>
            );
        }

        case CustomFilterType.SELECT: {
            return (
                <Col key={index} span={stacked ? 24 : span}>
                    <label className="mb-1 block text-sm font-semibold text-hub-muted">
                        {title || placeholder}
                    </label>
                    <CustomSelect
                        allowClear={allowClear ?? false}
                        maxTagCount={1}
                        mode={mode}
                        options={options}
                        placeholder={placeholder}
                        showSearch={showSearch ?? false}
                        value={value}
                        onChange={(selectedValue) => onChange?.(selectedValue)}
                    />
                </Col>
            );
        }
    }
};

export const FilterPanel = ({
    borderless = false,
    filterActions,
    hideToolbar = false,
    isOpen,
    onToggle,
    panelId: panelIdProp,
}: FilterPanelProps) => {
    const generatedId = useId();
    const panelId = panelIdProp ?? generatedId;
    const screens = Grid.useBreakpoint();
    const stacked = !screens.lg;

    const panelClassName = borderless
        ? 'rounded-none border-none bg-transparent p-0 shadow-none'
        : 'w-full rounded-xl border border-hub-border-card bg-hub-surface p-4';

    if (!filterActions.length) {
        return null;
    }

    return (
        <div className="w-full">
            {!hideToolbar && (
                <Flex className="w-full" justify="end">
                    <FilterPanelToolbar
                        hasFilters
                        isOpen={isOpen}
                        panelId={panelId}
                        onToggle={onToggle}
                    />
                </Flex>
            )}

            {isOpen && (
                <section
                    className={`${panelClassName} animate-in slide-in-from-top-2 duration-200`}
                    id={panelId}
                >
                    <Row align="bottom" gutter={[16, 16]}>
                        {filterActions.map((filter, index) =>
                            renderFilterItem(filter, index, stacked),
                        )}
                    </Row>
                </section>
            )}
        </div>
    );
};

type TableSectionToolbarProps = {
    filterValues?: CrudFilter[];
    hasFilters: boolean;
    isOpen: boolean;
    isRefreshing?: boolean;
    panelId?: string;
    onRefresh?: () => void;
    onToggle: () => void;
};

export const TableSectionToolbar = ({
    filterValues,
    hasFilters,
    isOpen,
    isRefreshing = false,
    panelId,
    onRefresh,
    onToggle,
}: TableSectionToolbarProps) => {
    if (!onRefresh && !hasFilters) {
        return null;
    }

    return (
        <div className="flex items-center justify-end gap-2">
            {onRefresh && (
                <CustomButton
                    touchFriendly
                    aria-label="Làm mới"
                    className="rounded-lg border border-hub-border bg-hub-surface px-3 text-hub-text shadow-none hover:!border-hub-primary hover:!text-hub-primary"
                    data-i18n-key="table.toolbar.refresh"
                    icon={
                        <Icon
                            className={`text-hub-muted ${isRefreshing ? 'animate-spin' : ''}`}
                            icon="lucide:refresh-cw"
                        />
                    }
                    loading={isRefreshing}
                    type="default"
                    onClick={onRefresh}
                />
            )}
            {hasFilters && (
                <FilterPanelToolbar
                    filterValues={filterValues}
                    hasFilters={hasFilters}
                    isOpen={isOpen}
                    panelId={panelId}
                    onToggle={onToggle}
                />
            )}
        </div>
    );
};
