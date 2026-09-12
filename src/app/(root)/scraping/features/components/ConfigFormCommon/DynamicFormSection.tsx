'use client';

import { CustomFlex, CustomRow } from '@/components/custom-antd';
import { useMemo } from 'react';
import { FEATURE_SECTION_CONTAINER_CLASS } from '../../constants';
import type { FormEvaluationContext, FormSectionSchema } from '../../types';
import { isFieldVisible } from '../../utils';
import { DynamicFormField } from './DynamicFormField';
import { FormDiffLabel } from './FormDiffLabel';
import { SectionHeader } from './SectionHeader';

export type DynamicFormSectionProps = {
    section: FormSectionSchema;
    evaluationContext: FormEvaluationContext;
};

export const DynamicFormSection = ({ section, evaluationContext }: DynamicFormSectionProps) => {
    if (!isFieldVisible(section.visibleWhen, evaluationContext)) {
        return null;
    }

    const titleContent = useMemo(
        () =>
            typeof section.title === 'function' ? section.title(evaluationContext) : section.title,
        [evaluationContext, section.title],
    );

    const titleHeader = useMemo(
        () =>
            typeof section.title === 'string' ? (
                section.title
            ) : (
                <FormDiffLabel label={titleContent} fieldKey={section.fields[0]?.name || ''} />
            ),
        [section.title, section.fields],
    );

    const descriptionContent = useMemo(
        () =>
            typeof section.description === 'function'
                ? section.description(evaluationContext)
                : section.description,
        [evaluationContext, section.description],
    );

    const iconName = useMemo(
        () =>
            typeof section.icon === 'function'
                ? section.icon(evaluationContext)
                : section.icon || 'lucide:sliders',
        [evaluationContext, section.icon],
    );

    const visibleFields = useMemo(
        () => section.fields.filter((f) => isFieldVisible(f.visibleWhen, evaluationContext)),
        [evaluationContext, section.fields],
    );

    if (!visibleFields?.length) return null;

    return (
        <CustomFlex vertical className={FEATURE_SECTION_CONTAINER_CLASS}>
            <SectionHeader icon={iconName} description={descriptionContent} title={titleHeader} />
            <CustomRow gutter={[16, 12]}>
                {visibleFields.map((fieldSchema) => (
                    <DynamicFormField
                        key={fieldSchema.name}
                        schema={fieldSchema}
                        evaluationContext={evaluationContext}
                    />
                ))}
            </CustomRow>
        </CustomFlex>
    );
};
