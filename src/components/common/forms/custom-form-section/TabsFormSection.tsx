'use client';

import { CustomFormField } from '@/components/common';
import {
    CustomFlex,
    CustomRow,
    CustomTabs,
    CustomTag,
    type FormInstance,
} from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import type { FormMode } from '@/hooks';
import type { ITabsFormSection } from '@/interfaces';
import { useMemo } from 'react';

export type TabsFormSectionProps<TValues extends object = Record<string, unknown>> = {
    mode: FormMode;
    section: ITabsFormSection<TValues>;
    form?: FormInstance<TValues>;
};

export const TabsFormSection = <TValues extends object = Record<string, unknown>>({
    mode,
    section,
    form,
}: TabsFormSectionProps<TValues>) => {
    const { activeKey, defaultActiveKey, onChange, tabsProps, items, className = '' } = section;

    const tabItems = useMemo(() => {
        return items
            .filter((item) => {
                if (typeof item.visible === 'function') {
                    return item.visible(mode, form);
                }
                return item.visible !== false;
            })
            .map((item) => {
                const labelNode = (
                    <CustomFlex align="center" gap={6}>
                        {item.icon && <Icon icon={item.icon} className="text-base" />}
                        <span>{item.label}</span>
                        {item.badge && (
                            <CustomTag
                                color={item.badgeColor || 'blue'}
                                className="m-0 text-xs px-1.5 py-0 rounded-md"
                            >
                                {item.badge}
                            </CustomTag>
                        )}
                    </CustomFlex>
                );

                return {
                    key: item.key,
                    label: labelNode,
                    forceRender: true,
                    disabled: item.disabled,
                    children: (
                        <div className="pt-2">
                            <CustomRow gutter={item.gutter || [16, 0]} className="w-full">
                                {item.fields.map((field) => (
                                    <CustomFormField
                                        key={String(field.name)}
                                        field={field}
                                        form={form}
                                        mode={mode}
                                    />
                                ))}
                            </CustomRow>
                        </div>
                    ),
                };
            });
    }, [items, form, mode]);

    if (!tabItems.length) return null;

    return (
        <div className={`w-full mb-4 ${className}`.trim()}>
            <CustomTabs
                items={tabItems}
                onChange={onChange}
                activeKey={activeKey}
                destroyOnHidden={false}
                defaultActiveKey={defaultActiveKey || items[0]?.key}
                {...tabsProps}
            />
        </div>
    );
};
