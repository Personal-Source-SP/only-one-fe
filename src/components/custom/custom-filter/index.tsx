'use client';

import { CustomFilterType } from '@/enums';
import { FilterItem } from '@/interfaces';
import { Icon } from '@iconify/react';
import { CrudFilter } from '@refinedev/core';
import { Button, Col, Flex, Grid, Input, Row, Select, Space } from 'antd';
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
                    <p className="mb-1 text-md font-semibold text-foreground-500">
                        {title || 'Tìm kiếm'}
                    </p>
                    <Input
                        placeholder={placeholder ?? 'Tìm kiếm'}
                        prefix={<Icon icon="lucide:search" className="text-foreground-500" />}
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
                    <p className="mb-1 text-md font-semibold text-foreground-500">
                        {title || placeholder}
                    </p>
                    <Select
                        mode={mode}
                        value={value}
                        maxTagCount={1}
                        options={options}
                        placeholder={placeholder}
                        showSearch={showSearch ?? false}
                        allowClear={allowClear ?? false}
                        onChange={(value) => onChange?.(value)}
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
                    } else if (filter.type === CustomFilterType.SELECT) {
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

    return (
        <Space direction="vertical" size="middle" className="w-full">
            {filterActions.length > 0 && (
                <Flex
                    align="center"
                    className="w-full"
                    gap={isMobile ? 4 : '50%'}
                    justify={searchFilter ? 'space-between' : 'end'}
                >
                    {searchFilter && (
                        <Input
                            className="w-full"
                            style={{ background: '#F3F4F6' }}
                            placeholder={searchFilter.placeholder ?? 'Tìm kiếm'}
                            prefix={<Icon icon="lucide:search" className="text-foreground-500" />}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                searchFilter.onChange?.(e.target.value.trim())
                            }
                        />
                    )}

                    <Space direction="horizontal" size={8}>
                        {selectFilters.length > 0 && (
                            <Button
                                type="text"
                                icon={<Icon icon="lucide:filter" />}
                                onClick={() => setCollapsed(!collapsed)}
                                className="border border-slate-200 rounded-lg p-3"
                            >
                                <span>Bộ lọc</span>
                                {filterValues?.length && filterValues?.length > 0 && (
                                    <span className="ml-1 bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                                        {filterValues.length}
                                    </span>
                                )}
                            </Button>
                        )}

                        {((filterValues?.length && filterValues?.length > 0) || searchFilter) && (
                            <Button
                                type="text"
                                onClick={handleClearFilters}
                                disabled={!filterValues?.length && !searchFilter}
                                icon={
                                    <Icon
                                        icon="lucide:refresh-cw"
                                        className="text-slate-400 w-4 h-4"
                                    />
                                }
                            />
                        )}
                    </Space>
                </Flex>
            )}

            {collapsed && (
                <div className="bg-slate-50 p-2 md:p-4 rounded-xl border border-slate-200 animate-in slide-in-from-top-2 duration-200 w-full">
                    <Row gutter={[16, 8]}>
                        {selectFilters.map((filter, index) =>
                            renderFilterItem(filter, index, isMobile),
                        )}
                    </Row>
                </div>
            )}
        </Space>
    );
};
