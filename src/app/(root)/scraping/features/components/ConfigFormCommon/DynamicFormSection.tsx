'use client';

import { CustomFlex, CustomRow } from '@/components/custom-antd';
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

    const titleContent =
        typeof section.title === 'function' ? section.title(evaluationContext) : section.title;

    const descriptionContent =
        typeof section.description === 'function'
            ? section.description(evaluationContext)
            : section.description;

    const iconName =
        typeof section.icon === 'function'
            ? section.icon(evaluationContext)
            : section.icon || 'lucide:sliders';

    const visibleFields = section.fields.filter((f) =>
        isFieldVisible(f.visibleWhen, evaluationContext),
    );

    if (visibleFields.length === 0) return null;

    return (
        <CustomFlex vertical className={FEATURE_SECTION_CONTAINER_CLASS}>
            <SectionHeader
                icon={iconName}
                description={descriptionContent}
                title={
                    typeof titleContent === 'string' ? (
                        titleContent
                    ) : (
                        <FormDiffLabel
                            label={titleContent}
                            fieldKey={section.fields[0]?.name || ''}
                        />
                    )
                }
            />
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
