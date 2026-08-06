'use client';

import { CustomInput } from '@/components/custom';
import React, { useCallback } from 'react';

const { TextArea } = CustomInput;

export interface HtmlEditorProps {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    rows?: number;
    disabled?: boolean;
    className?: string;
}

export const HtmlEditor = ({
    value = '',
    onChange,
    placeholder = 'Nhập nội dung HTML...',
    rows = 6,
    disabled = false,
    className = '',
}: HtmlEditorProps) => {
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            onChange?.(e.target.value);
        },
        [onChange],
    );

    return (
        <TextArea
            rows={rows}
            value={value}
            disabled={disabled}
            placeholder={placeholder}
            onChange={handleChange}
            className={`font-mono text-sm ${className}`.trim()}
        />
    );
};
