'use client';

import { CustomButton, CustomInput, CustomSelect } from '@/components/custom';
import {
    CUSTOM_FILTER_BADGE_CLASS_NAME,
    CUSTOM_FILTER_LABEL_CLASS_NAME,
    CUSTOM_FILTER_PANEL_CLASS_NAME,
} from '@/constants';
import { CustomFilterType } from '@/enums';
import { FilterItem } from '@/interfaces';
import { Icon } from '@iconify/react';
import { CrudFilter } from '@refinedev/core';
import { Col, Flex, Grid, Row, Space } from 'antd';
import { ChangeEvent, useMemo, useState } from 'react';

type CustomFilterProps = {
    filterActions: FilterItem[];
    filterValues?: CrudFilter[];
    onClearFilters?: () => void;
};

const renderFilterItem = (filterItem: FilterItem, index: number, isMobile: boolean) => {
    const {
        type,
        span,
        value,
        options,
        placeholder,
        showSearch,
        allowClear,
        mode,
        title,
        onChange,
    } = filterItem;

    switch (type) {
        case CustomFilterType.SEARCH: {
            return (
                <Col span={isMobile ? 24 : span} key={index}>
                    <label className={CUSTOM_FILTER_LABEL_CLASS_NAME}>{title || 'Tìm kiếm'}</label>
                    <CustomInput
                        touchFriendly={isMobile}
                        placeholder={placeholder ?? 'Tìm kiếm'}
                        prefix={<Icon icon="lucide:search" className="text-hub-muted" />}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            onChange?.(e.target.value.trim())
                        }
                    />
                </Col>
            );
        }

        case CustomFilterType.SELECT: {
            return (
                <Col span={isMobile ? 24 : span} key={index}>
                    <label className={CUSTOM_FILTER_LABEL_CLASS_NAME}>{title || placeholder}</label>
                    <CustomSelect
                        mode={mode}
                        value={value}
                        maxTagCount={1}
                        options={options}
                        placeholder={placeholder}
                        showSearch={showSearch ?? false}
                        allowClear={allowClear ?? false}
                        onChange={(selectedValue) => onChange?.(selectedValue)}
                    />
                </Col>
            );
        }
    }
};

export const CustomFilter = ({
    filterActions,
    filterValues,
    onClearFilters,
}: CustomFilterProps) => {
    const screens = Grid.useBreakpoint();
    const isMobile = !screens.md;

    const [collapsed, setCollapsed] = useState(false);

    const [searchFilter, selectFilters] = useMemo(
        () =>
            filterActions?.reduce<[FilterItem | undefined, FilterItem[]]>(
                ([search, selects], filter) => {
                    if (filter.type === CustomFilterType.SEARCH) {
                        return [filter, selects];
                    }
                    if (filter.type === CustomFilterType.SELECT) {
                        return [search, [...selects, filter]];
                    }
                    return [search, selects];
                },
                [undefined, []],
            ),
        [filterActions],
    );

    const handleClearFilters = () => {
        setCollapsed(false);
        onClearFilters?.();
    };

    const hasActiveFilters = Boolean(filterValues?.length);

    if (!filterActions.length) {
        return null;
    }

    if (!isMobile) {
        return (
            <section className={CUSTOM_FILTER_PANEL_CLASS_NAME}>
                <Row align="bottom" gutter={[16, 16]}>
                    {filterActions.map((filter, index) => renderFilterItem(filter, index, false))}
                    {onClearFilters && (
                        <Col flex="none">
                            <CustomButton type="default" onClick={handleClearFilters}>
                                Xóa lọc
                            </CustomButton>
                        </Col>
                    )}
                </Row>
            </section>
        );
    }

    return (
        <Space direction="vertical" size="middle" className="w-full">
            <Flex
                align="center"
                className="w-full"
                gap={8}
                justify={searchFilter ? 'space-between' : 'end'}
            >
                {searchFilter && (
                    <CustomInput
                        touchFriendly
                        className="w-full"
                        placeholder={searchFilter.placeholder ?? 'Tìm kiếm'}
                        prefix={<Icon icon="lucide:search" className="text-hub-muted" />}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            searchFilter.onChange?.(e.target.value.trim())
                        }
                    />
                )}

                <Space direction="horizontal" size={8}>
                    {!!selectFilters.length && (
                        <CustomButton
                            type="default"
                            icon={<Icon icon="lucide:filter" />}
                            onClick={() => setCollapsed(!collapsed)}
                            className="rounded-lg border border-hub-border p-3"
                        >
                            <span>{collapsed ? 'Thu gọn bộ lọc' : 'Bộ lọc'}</span>
                            {hasActiveFilters && (
                                <span className={CUSTOM_FILTER_BADGE_CLASS_NAME}>
                                    {filterValues?.length}
                                </span>
                            )}
                        </CustomButton>
                    )}

                    {(hasActiveFilters || searchFilter) && (
                        <CustomButton
                            type="text"
                            onClick={handleClearFilters}
                            disabled={!hasActiveFilters}
                            icon={
                                <Icon icon="lucide:refresh-cw" className="h-4 w-4 text-hub-muted" />
                            }
                            aria-label="Xóa lọc"
                        />
                    )}
                </Space>
            </Flex>

            {collapsed && !!selectFilters.length && (
                <section
                    className={`${CUSTOM_FILTER_PANEL_CLASS_NAME} animate-in slide-in-from-top-2 duration-200`}
                >
                    <Row gutter={[16, 8]}>
                        {selectFilters.map((filter, index) =>
                            renderFilterItem(filter, index, true),
                        )}
                    </Row>
                </section>
            )}
        </Space>
    );
};
