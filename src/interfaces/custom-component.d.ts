import { CodeDisplayProps } from '@/components/module/code-display';
import { Option } from '@/interfaces/common';
import { Rule } from 'antd/es/form';
import { FormInstance } from 'antd/lib';
import { ReactNode } from 'react';

export interface FormFieldItem {
    name: string;
    type: 'input' | 'select' | 'textarea' | 'switch' | 'code-display' | 'upload';
    label: string;

    span?: number;
    rules?: Rule[];
    hidden?: boolean;
    tooltip?: string;
    disabled?: boolean;
    onChange?: (value: any, form?: FormInstance) => void;
    codeProps?: Omit<CodeDisplayProps, 'code' | 'onCodeChange'>;
    inputProps?: {
        placeholder?: string;
        addonAfter?: ReactNode;
        addonBefore?: ReactNode;
    };
    selectProps?: {
        placeholder?: string;
        options?: Option[];
        allowClear?: boolean;
        showSearch?: boolean;
    };
    switchProps?: {
        placeholder?: string;
    };
    textareaProps?: {
        placeholder?: string;
        rows?: number;
    };
    uploadProps?: {
        accept?: string;
        maxCount?: number;
        multiple?: boolean;
    };
    elementTopRender?: ReactNode;
    elementBottomRender?: ReactNode;
}
