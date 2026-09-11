'use client';

import { CodeDisplay } from '@/components/common';
import {
    CustomCol,
    CustomFlex,
    CustomForm,
    CustomSwitch,
    CustomTypography,
} from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { useEffect, useRef, useState } from 'react';
import { useFeatureModalContext } from '@/app/(root)/scraping/features/context';
import type {
    FormEvaluationContext,
    JsonToggleFormFieldSchema,
} from '@/app/(root)/scraping/features/types';
import { FormDiffLabel } from '../FormDiffLabel';

export type JsonToggleWidgetProps = {
    schema: JsonToggleFormFieldSchema;
    evaluationContext: FormEvaluationContext;
    colProps: Record<string, unknown>;
};

export const JsonToggleWidget = ({
    schema,
    evaluationContext,
    colProps,
}: JsonToggleWidgetProps) => {
    const { form, isViewingHistory } = useFeatureModalContext();
    const fieldValue = CustomForm.useWatch(schema.name, form);
    const rawProps =
        (typeof schema.fieldProps === 'function'
            ? schema.fieldProps(evaluationContext)
            : schema.fieldProps) || {};
    const iconName = (rawProps.icon as string) || 'lucide:code-2';
    const defaultEmptyValue = (rawProps.defaultEmptyValue as string) || '{\n  \n}';

    const [hasContent, setHasContent] = useState<boolean>(Boolean(fieldValue?.trim()));
    const cachedValueRef = useRef<string>(fieldValue || '');

    const labelText =
        typeof schema.label === 'function' ? schema.label(evaluationContext) : schema.label;
    const desc =
        typeof schema.description === 'function'
            ? schema.description(evaluationContext)
            : schema.description;

    useEffect(() => {
        if (fieldValue && fieldValue.trim()) {
            setHasContent(true);
            cachedValueRef.current = fieldValue;
        } else if (!fieldValue) {
            setHasContent(false);
        }
    }, [fieldValue]);

    const handleToggle = (checked: boolean) => {
        setHasContent(checked);
        if (checked) {
            const restored = cachedValueRef.current || defaultEmptyValue;
            form.setFieldValue(schema.name, restored);
        } else {
            if (fieldValue) cachedValueRef.current = fieldValue;
            form.setFieldValue(schema.name, undefined);
        }
    };

    return (
        <CustomCol {...colProps}>
            <CustomFlex
                vertical
                gap={10}
                className="p-3.5 rounded-xl border border-hub-border/50 bg-hub-card/40 transition-all"
            >
                <CustomFlex align="center" justify="space-between">
                    <CustomFlex align="center" gap={8}>
                        <Icon icon={iconName} className="text-hub-primary text-base" />
                        <CustomFlex vertical gap={2}>
                            <FormDiffLabel
                                fieldKey={schema.name}
                                label={labelText as string}
                                className="font-semibold text-xs text-hub-title"
                            />
                            {desc && (
                                <CustomTypography.Text className="text-xs text-hub-subtitle">
                                    {desc}
                                </CustomTypography.Text>
                            )}
                        </CustomFlex>
                    </CustomFlex>
                    <CustomSwitch
                        checked={hasContent}
                        onChange={handleToggle}
                        checkedChildren="Bật"
                        unCheckedChildren="Tắt"
                        disabled={isViewingHistory || rawProps.disabled}
                    />
                </CustomFlex>

                {hasContent ? (
                    <CustomForm.Item name={schema.name} noStyle>
                        <CodeDisplay
                            language="json"
                            maxHeight={rawProps.maxHeight || '160px'}
                            code={fieldValue || ''}
                            onCodeChange={
                                !isViewingHistory && !rawProps.disabled
                                    ? (newCode: string): void => {
                                          cachedValueRef.current = newCode;
                                          form.setFieldValue(schema.name, newCode);
                                      }
                                    : undefined
                            }
                        />
                    </CustomForm.Item>
                ) : (
                    <CustomTypography.Text className="text-xs text-hub-subtitle italic">
                        Chưa kích hoạt tùy chỉnh {labelText as string}
                    </CustomTypography.Text>
                )}
            </CustomFlex>
        </CustomCol>
    );
};
