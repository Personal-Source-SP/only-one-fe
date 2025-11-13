'use client';

import { CustomFilterType } from '@/enums';
import { FilterItem } from '@/interfaces';
import { Icon } from '@iconify/react';
import { Col, Input, Row, Select } from 'antd';
import { FC, memo } from 'react';

type CustomFilterProps = {
    filters: FilterItem[];
};

const CustomFilter: FC<CustomFilterProps> = ({ filters }) => {
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
                            onChange={(e) => onChange?.(e.target.value.trim())}
                            prefix={<Icon icon="lucide:search" className="text-foreground-500" />}
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

    if (!filters?.length) return null;

    return (
        <Row gutter={[16, 8]} className="py-3">
            {filters.map((filter, index) => renderFilterItem(filter, index))}
        </Row>
    );
};

export default memo(CustomFilter);
