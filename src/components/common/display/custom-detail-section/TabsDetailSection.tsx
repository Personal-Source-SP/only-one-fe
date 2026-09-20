'use client';

import { CustomTabs } from '@/components/custom-antd';
import type { IDetailSection, ITabsDetailSection } from '@/interfaces';
import type { ComponentType, ReactNode } from 'react';
import { useMemo } from 'react';

export type TabsDetailSectionProps<TRecord extends object = Record<string, unknown>> = {
    section: ITabsDetailSection<TRecord>;
    record: TRecord;
    CustomDetailSectionComponent: ComponentType<{
        sections?: IDetailSection<TRecord>[];
        record: TRecord;
        className?: string;
    }>;
};

export const TabsDetailSection = <TRecord extends object = Record<string, unknown>>({
    section,
    record,
    CustomDetailSectionComponent,
}: TabsDetailSectionProps<TRecord>) => {
    const { items, activeKey, defaultActiveKey, onChange, className = '', tabsProps } = section;

    const tabItems = useMemo(() => {
        return items
            .filter((item) => {
                if (typeof item.visible === 'function') return item.visible(record);
                return item.visible !== false;
            })
            .map((item) => {
                let content: ReactNode = null;
                if (typeof item.children === 'function') {
                    content = item.children(record);
                } else if (item.children !== undefined) {
                    content = item.children;
                } else if (item.sections?.length) {
                    content = (
                        <CustomDetailSectionComponent sections={item.sections} record={record} />
                    );
                }

                return {
                    key: item.key,
                    label: item.label,
                    disabled: item.disabled,
                    children: content,
                };
            });
    }, [items, record, CustomDetailSectionComponent]);

    return (
        <CustomTabs
            activeKey={activeKey}
            defaultActiveKey={defaultActiveKey ?? tabItems[0]?.key}
            onChange={onChange}
            items={tabItems}
            className={`w-full ${className}`.trim()}
            {...tabsProps}
        />
    );
};
