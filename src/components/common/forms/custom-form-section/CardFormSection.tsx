'use client';

import { CustomFormField } from '@/components/common';
import { CustomFlex, CustomRow, type FormInstance } from '@/components/custom-antd';
import type { FormMode } from '@/hooks';
import type { ICardFormSection } from '@/interfaces';
import { useMemo } from 'react';
import { SectionHeader } from './SectionHeader';

export type CardFormSectionProps<TValues extends object = Record<string, unknown>> = {
    mode: FormMode;
    section: ICardFormSection<TValues>;
    form?: FormInstance<TValues>;
};

export const CardFormSection = <TValues extends object = Record<string, unknown>>({
    mode,
    section,
    form,
}: CardFormSectionProps<TValues>) => {
    const {
        title,
        description,
        icon,
        badge,
        badgeColor,
        extra,
        className = '',
        gutter = [16, 0],
        fields,
    } = section;

    if (!fields?.length) return null;

    const hasHeader = useMemo(() => {
        return Boolean(title || description || icon || badge || extra);
    }, [badge, badgeColor, description, extra, icon, title]);

    return (
        <CustomFlex
            vertical
            gap={12}
            className={`w-full p-4 rounded-xl border border-hub-border/60 bg-hub-card/40 mb-4 transition-all ${className}`.trim()}
        >
            {hasHeader && (
                <SectionHeader
                    icon={icon}
                    title={title}
                    badge={badge}
                    extra={extra}
                    badgeColor={badgeColor}
                    description={description}
                />
            )}

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
        </CustomFlex>
    );
};
