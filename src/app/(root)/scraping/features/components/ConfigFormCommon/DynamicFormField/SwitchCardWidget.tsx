'use client';

import {
    CustomCol,
    CustomFlex,
    CustomForm,
    CustomSwitch,
    CustomTypography,
} from '@/components/custom-antd';
import { useFeatureModalContext } from '@/app/(root)/scraping/features/context';
import type {
    FormEvaluationContext,
    SwitchCardFormFieldSchema,
} from '@/app/(root)/scraping/features/types';
import { FormDiffLabel } from '../FormDiffLabel';

export type SwitchCardWidgetProps = {
    schema: SwitchCardFormFieldSchema;
    colProps: Record<string, unknown>;
    evaluationContext: FormEvaluationContext;
};

export const SwitchCardWidget = ({
    schema,
    colProps,
    evaluationContext,
}: SwitchCardWidgetProps) => {
    const { isViewingHistory } = useFeatureModalContext();

    const labelText =
        typeof schema.label === 'function' ? schema.label(evaluationContext) : schema.label;

    const desc =
        typeof schema.description === 'function'
            ? schema.description(evaluationContext)
            : schema.description;

    const rawProps =
        typeof schema.fieldProps === 'function'
            ? schema.fieldProps(evaluationContext)
            : schema.fieldProps || {};

    return (
        <CustomCol {...colProps}>
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-hub-border/50 bg-hub-card/40 hover:bg-hub-card/70 transition-all">
                <CustomFlex vertical gap={2} className="pr-3">
                    <FormDiffLabel
                        fieldKey={schema.name}
                        label={labelText as string}
                        className="font-medium text-xs text-hub-title"
                    />
                    {desc && (
                        <CustomTypography.Text className="text-xs text-hub-subtitle">
                            {desc}
                        </CustomTypography.Text>
                    )}
                </CustomFlex>
                <CustomForm.Item name={schema.name} valuePropName="checked" noStyle>
                    <CustomSwitch
                        checkedChildren="Bật"
                        unCheckedChildren="Tắt"
                        className={rawProps.className}
                        disabled={isViewingHistory || rawProps.disabled}
                    />
                </CustomForm.Item>
            </div>
        </CustomCol>
    );
};
