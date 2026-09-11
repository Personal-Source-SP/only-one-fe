import type { FormEvaluationContext, FormSectionSchema, VisibilityCondition } from '../types';

export const isFieldVisible = (
    condition: VisibilityCondition | undefined,
    context: FormEvaluationContext,
): boolean => {
    if (condition === undefined) return true;
    if (typeof condition === 'boolean') return condition;
    if (Array.isArray(condition)) return condition.includes(context.service);
    if (typeof condition === 'function') return condition(context);
    return true;
};

export const getDefaultFormValuesFromSections = (
    sections: FormSectionSchema[],
    context: FormEvaluationContext,
): Record<string, unknown> => {
    const defaults: Record<string, unknown> = {};
    for (const section of sections) {
        if (!isFieldVisible(section.visibleWhen, context)) continue;
        for (const field of section.fields) {
            if (!isFieldVisible(field.visibleWhen, context)) continue;
            if (field.defaultValue !== undefined) {
                defaults[field.name] =
                    typeof field.defaultValue === 'function'
                        ? field.defaultValue(context)
                        : field.defaultValue;
            }
        }
    }
    return defaults;
};
