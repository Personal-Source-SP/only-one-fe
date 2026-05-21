'use client';

import { CustomInput, CustomSelect } from '@/components/custom';
import { CustomFilterType } from '@/enums';
import { FilterItem } from '@/interfaces';
import { Icon } from '@iconify/react';
import { CustomCol } from '@/components/custom';
import { ChangeEvent } from 'react';

export const renderFilterItem = (filterItem: FilterItem, index: number, stacked: boolean) => {
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
                <CustomCol key={index} span={stacked ? 24 : span}>
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
                </CustomCol>
            );
        }

        case CustomFilterType.SELECT: {
            return (
                <CustomCol key={index} span={stacked ? 24 : span}>
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
                </CustomCol>
            );
        }
    }
};
