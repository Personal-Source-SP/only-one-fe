'use client';

import {
    CustomBadge,
    CustomDescriptions,
    CustomTag,
    CustomTypography,
} from '@/components/custom-antd';
import type { IDescriptionsDetailSection, IDetailDescriptionItem } from '@/interfaces';
import { formatDate } from '@/libs';
import get from 'lodash/get';
import type { ReactNode } from 'react';

const { Text } = CustomTypography;

const renderFormattedValue = <TRecord extends object>(
    item: IDetailDescriptionItem<TRecord>,
    rawVal: unknown,
    record: TRecord,
): ReactNode => {
    if (item.render) {
        return item.render(rawVal, record);
    }

    if (rawVal === undefined || rawVal === null || rawVal === '') {
        return item.emptyText ?? <Text type="secondary">---</Text>;
    }

    switch (item.format) {
        case 'datetime':
            return formatDate(rawVal as string | Date, 'full');
        case 'date':
            return formatDate(rawVal as string | Date, 'short');
        case 'time':
            return String(rawVal);
        case 'boolean':
            return (
                <CustomBadge
                    status={rawVal ? 'success' : 'default'}
                    text={rawVal ? 'Hoạt động' : 'Tắt'}
                />
            );
        case 'badge': {
            const badgeProps = item.badgeProps?.(rawVal, record) ?? {
                status: 'default',
                text: String(rawVal),
            };
            return <CustomBadge {...badgeProps} />;
        }
        case 'tag': {
            const color =
                typeof item.tagColor === 'function' ? item.tagColor(rawVal, record) : item.tagColor;
            return <CustomTag color={color}>{String(rawVal)}</CustomTag>;
        }
        case 'json':
            return (
                <pre className="p-2 text-xs rounded bg-hub-card/40 border border-hub-border overflow-x-auto">
                    {JSON.stringify(rawVal, null, 2)}
                </pre>
            );
        case 'number':
            return typeof rawVal === 'number' ? rawVal.toLocaleString('vi-VN') : String(rawVal);
        case 'currency':
            return typeof rawVal === 'number'
                ? `${rawVal.toLocaleString('vi-VN')} ₫`
                : String(rawVal);
        default: {
            const textContent = String(rawVal);
            if (item.copyable) {
                return (
                    <Text strong={item.strong} copyable>
                        {textContent}
                    </Text>
                );
            }
            if (item.strong) {
                return <Text strong>{textContent}</Text>;
            }
            return textContent;
        }
    }
};

export type DescriptionsDetailSectionProps<TRecord extends object = Record<string, unknown>> = {
    section: IDescriptionsDetailSection<TRecord>;
    record: TRecord;
};

export const DescriptionsDetailSection = <TRecord extends object = Record<string, unknown>>({
    section,
    record,
}: DescriptionsDetailSectionProps<TRecord>) => {
    const {
        items,
        title,
        extra,
        size = 'small',
        bordered = true,
        column = { xs: 1, sm: 2 },
        className = '',
        descriptionsProps,
    } = section;

    const visibleItems = items.filter((item) => {
        if (typeof item.visible === 'function') return item.visible(record);
        return item.visible !== false;
    });

    return (
        <CustomDescriptions
            bordered={bordered}
            size={size}
            title={title}
            extra={extra}
            column={column}
            className={`w-full ${className}`.trim()}
            {...descriptionsProps}
        >
            {visibleItems.map((item, index) => {
                const rawVal = item.name ? get(record, item.name) : undefined;
                const key = Array.isArray(item.name)
                    ? item.name.join('.')
                    : String(item.name || `desc-item-${index}`);

                return (
                    <CustomDescriptions.Item key={key} label={item.label} span={item.span}>
                        {renderFormattedValue(item, rawVal, record)}
                    </CustomDescriptions.Item>
                );
            })}
        </CustomDescriptions>
    );
};
