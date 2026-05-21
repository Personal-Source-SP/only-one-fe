'use client';

import { CustomButton, CustomInput, CustomSelect } from '@/components/custom';
import {
    CUSTOM_FILTER_BADGE_CLASS_NAME,
    CUSTOM_FILTER_LABEL_CLASS_NAME,
    CUSTOM_FILTER_PANEL_CLASS_NAME,
    CUSTOM_FILTER_SEARCH_LABEL,
    CUSTOM_FILTER_TOGGLE_COLLAPSE_LABEL,
    CUSTOM_FILTER_TOGGLE_EXPAND_LABEL,
    CUSTOM_FILTER_TOOLBAR_TOGGLE_CLASS_NAME,
} from '@/constants';
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
    const toggleLabel = isOpen
        ? CUSTOM_FILTER_TOGGLE_COLLAPSE_LABEL
        : CUSTOM_FILTER_TOGGLE_EXPAND_LABEL;

    if (!hasFilters) {
        return null;
    }

    return (
        <CustomButton
            touchFriendly
            aria-controls={resolvedPanelId}
            aria-expanded={isOpen}
            aria-label={toggleLabel}
            className={CUSTOM_FILTER_TOOLBAR_TOGGLE_CLASS_NAME}
            icon={<Icon className="text-hub-muted" icon="lucide:filter" />}
            type="default"
            onClick={onToggle}
        >
            {toggleLabel}
            {hasActiveFilters && (
                <span className={CUSTOM_FILTER_BADGE_CLASS_NAME}>{filterValues?.length}</span>
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
                    <label className={CUSTOM_FILTER_LABEL_CLASS_NAME}>
                        {title || CUSTOM_FILTER_SEARCH_LABEL}
                    </label>
                    <CustomInput
                        placeholder={placeholder ?? CUSTOM_FILTER_SEARCH_LABEL}
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
                    <label className={CUSTOM_FILTER_LABEL_CLASS_NAME}>{title || placeholder}</label>
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
        : CUSTOM_FILTER_PANEL_CLASS_NAME;

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
