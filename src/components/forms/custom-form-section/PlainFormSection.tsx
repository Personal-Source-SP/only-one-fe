'use client';

import { CustomFlex, CustomRow, CustomTypography, type FormInstance } from '@/components';
import type { FormMode } from '@/hooks';

import { CustomFormField } from './CustomFormField';
import type { IPlainFormSection } from './types';

export type PlainFormSectionProps<TValues extends object = Record<string, unknown>> = {
    section: IPlainFormSection<TValues>;
    form?: FormInstance<TValues>;
    mode: FormMode;
};

export const PlainFormSection = <TValues extends object = Record<string, unknown>>({
    section,
    form,
    mode,
}: PlainFormSectionProps<TValues>) => {
    const { title, description, className = '', gutter = [16, 0], fields } = section;

    if (!fields?.length) return null;

    return (
        <CustomFlex vertical gap={8} className={`w-full mb-4 ${className}`.trim()}>
            {title && (
                <CustomFlex vertical gap={2}>
                    <CustomTypography.Text strong className="text-sm font-semibold text-hub-title">
                        {title}
                    </CustomTypography.Text>
                    {description && (
                        <CustomTypography.Text className="text-xs text-hub-subtitle">
                            {description}
                        </CustomTypography.Text>
                    )}
                </CustomFlex>
            )}

            <CustomRow gutter={gutter} className="w-full">
                {fields.map((field) => (
                    <CustomFormField
                        key={String(field.name)}
                        field={field}
                        form={form}
                        mode={mode}
                    />
                ))}
            </CustomRow>
        </CustomFlex>
    );
};
