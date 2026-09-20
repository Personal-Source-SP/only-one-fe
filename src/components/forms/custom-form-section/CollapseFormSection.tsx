'use client';

import { useState } from 'react';

import { CustomFlex, CustomRow, type FormInstance } from '@/components';
import type { FormMode } from '@/hooks';

import { CustomFormField } from './CustomFormField';
import { SectionHeader } from './SectionHeader';
import type { ICollapseFormSection } from './types';

export type CollapseFormSectionProps<TValues extends object = Record<string, unknown>> = {
    mode: FormMode;
    section: ICollapseFormSection<TValues>;
    form?: FormInstance<TValues>;
};

export const CollapseFormSection = <TValues extends object = Record<string, unknown>>({
    mode,
    section,
    form,
}: CollapseFormSectionProps<TValues>) => {
    const {
        title,
        description,
        icon,
        badge,
        badgeColor,
        extra,
        className = '',
        gutter = [16, 0],
        defaultCollapsed = false,
        fields,
    } = section;

    const [collapsed, setCollapsed] = useState(defaultCollapsed);

    if (!fields?.length) return null;

    return (
        <CustomFlex
            vertical
            gap={12}
            className={`w-full p-4 rounded-xl border border-hub-border/60 bg-hub-card/40 mb-4 transition-all ${className}`.trim()}
        >
            <SectionHeader
                collapsible
                icon={icon}
                title={title}
                badge={badge}
                extra={extra}
                collapsed={collapsed}
                badgeColor={badgeColor}
                description={description}
                onToggleCollapse={() => setCollapsed((prev) => !prev)}
            />

            {!collapsed && (
                <CustomRow gutter={gutter} className="w-full">
                    {fields.map((field) => (
                        <CustomFormField
                            field={field}
                            form={form}
                            mode={mode}
                            key={String(field.name)}
                        />
                    ))}
                </CustomRow>
            )}
        </CustomFlex>
    );
};
