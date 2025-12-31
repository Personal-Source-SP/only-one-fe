'use client';

import { CustomFilterType } from '@/enums';
import { FilterItem } from '@/interfaces';
import { Icon } from '@iconify/react';
import { CrudFilter } from '@refinedev/core';
import { Button, Col, Flex, Input, Row, Select, Space } from 'antd';
import { ChangeEvent, useMemo, useState } from 'react';

type CustomFilterProps = {
    filterActions: FilterItem[];
    filterValues?: CrudFilter[];
    onClearFilters?: () => void;
};

const CustomFilter = ({ filterActions, filterValues, onClearFilters }: CustomFilterProps) => {
    const [collapsed, setCollapsed] = useState(false);

    const [searchFilter, selectFilters] = useMemo(() => {
        const searchFilter = filterActions.find(
            (filter) => filter.type === CustomFilterType.SEARCH,
        );

        const selectFilters = filterActions.filter(
            (filter) => filter.type === CustomFilterType.SELECT,
        );

        return [searchFilter, selectFilters];
    }, [filterActions]);

    const renderFilterItem = (filterItem: FilterItem, index: number) => {
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
                    <Col span={span} key={index}>
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
                    <Col span={span} key={index}>
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

    const handleClearFilters = () => {
        setCollapsed(false);
        onClearFilters?.();
    };

    return (
        <Space direction="vertical" size="middle" className="w-full">
            {filterActions.length > 0 && (
                <Flex align="center" justify={searchFilter ? 'space-between' : 'end'} gap="50%">
                    {searchFilter && (
                        <Input
                            className="w-full"
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
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 animate-in slide-in-from-top-2 duration-200">
                    <Row gutter={[16, 8]}>
                        {selectFilters.map((filter, index) => renderFilterItem(filter, index))}
                    </Row>
                </div>
            )}
        </Space>
    );
};

export default CustomFilter;
