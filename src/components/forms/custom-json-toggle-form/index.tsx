'use client';

import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';

import { CodeDisplay } from '@/components';
import {
    CustomFlex,
    CustomForm,
    CustomSwitch,
    CustomTypography,
    type FormInstance,
    type FormItemProps,
} from '@/components';

export type CustomJsonToggleFormProps<TValues extends object = Record<string, unknown>> = {
    name: FormItemProps['name'];
    icon?: string;
    label?: ReactNode;
    maxHeight?: string;
    disabled?: boolean;
    description?: ReactNode;
    defaultEmptyValue?: string;
    form?: FormInstance<TValues>;
    formItemProps?: Omit<FormItemProps, 'children' | 'label' | 'name' | 'rules'>;
};

export const CustomJsonToggleForm = <TValues extends object = Record<string, unknown>>({
    name,
    icon = 'lucide:code-2',
    label,
    maxHeight,
    disabled = false,
    description,
    defaultEmptyValue = '{\n  \n}',
    form,
    formItemProps,
}: CustomJsonToggleFormProps<TValues>) => {
    const fieldValue = CustomForm.useWatch(name ?? '', form);
    const cachedValueRef = useRef<string>(fieldValue || '');

    const [hasContent, setHasContent] = useState<boolean>(Boolean(fieldValue?.trim()));

    useEffect(() => {
        if (fieldValue && fieldValue.trim()) {
            setHasContent(true);
            cachedValueRef.current = fieldValue;
        } else if (!fieldValue) {
            setHasContent(false);
        }
    }, [fieldValue]);

    const handleToggle = useCallback(
        (checked: boolean) => {
            setHasContent(checked);
            if (checked) {
                const restored = cachedValueRef.current || defaultEmptyValue;
                if (name && form) form.setFieldValue(name, restored);
            } else {
                if (fieldValue) cachedValueRef.current = fieldValue;
                if (name && form) form.setFieldValue(name, undefined);
            }
        },
        [defaultEmptyValue, fieldValue, form, name],
    );

    const handleCodeChange = useCallback(
        (newCode: string): void => {
            cachedValueRef.current = newCode;
            if (name && form) form.setFieldValue(name, newCode);
        },
        [form, name],
    );

    return (
        <CustomFlex
            vertical
            gap={10}
            className={`p-3.5 rounded-xl border border-hub-border/50 bg-hub-card/40 transition-all ${formItemProps?.className ?? ''}`.trim()}
        >
            <CustomFlex align="center" justify="space-between">
                <CustomFlex align="center" gap={8}>
                    {icon && <Icon icon={icon} className="text-hub-primary text-base" />}
                    <CustomFlex vertical gap={2}>
                        {label && (
                            <span className="font-semibold text-xs text-hub-title">{label}</span>
                        )}
                        {description && (
                            <CustomTypography.Text className="text-xs text-hub-subtitle">
                                {description}
                            </CustomTypography.Text>
                        )}
                    </CustomFlex>
                </CustomFlex>
                <CustomSwitch
                    disabled={disabled}
                    checked={hasContent}
                    onChange={handleToggle}
                    checkedChildren="Bật"
                    unCheckedChildren="Tắt"
                />
            </CustomFlex>

            {hasContent ? (
                <CustomForm.Item {...formItemProps} name={name as any} noStyle>
                    <CodeDisplay
                        language="json"
                        code={fieldValue}
                        maxHeight={maxHeight}
                        onCodeChange={!disabled ? handleCodeChange : undefined}
                    />
                </CustomForm.Item>
            ) : (
                <CustomTypography.Text className="text-xs text-hub-subtitle italic">
                    Chưa kích hoạt tùy chỉnh {typeof label === 'string' ? label : ''}
                </CustomTypography.Text>
            )}
        </CustomFlex>
    );
};
