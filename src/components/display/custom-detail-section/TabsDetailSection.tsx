'use client';

import { CustomTabs } from '@/components';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { CustomDetailSection } from './index';
import type { ITabsDetailSection } from './types';

export type TabsDetailSectionProps<TRecord extends object = Record<string, unknown>> = {
    section: ITabsDetailSection<TRecord>;
    record: TRecord;
};

export const TabsDetailSection = <TRecord extends object = Record<string, unknown>>({
    section,
    record,
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
                } else if (item.children) {
                    content = item.children;
                } else if (item.sections?.length) {
                    content = <CustomDetailSection sections={item.sections} record={record} />;
                }

                return {
                    key: item.key,
                    label: item.label,
                    disabled: item.disabled,
                    children: content,
                };
            });
    }, [items, record]);

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
