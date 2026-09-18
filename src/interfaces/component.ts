import { CodeDisplayProps } from '@/components/common';
import type { FormInstance, Rule } from '@/components/custom-antd';
import { ReactNode } from 'react';
import { IOption } from './common';

export type CustomCardPadding = 'sm' | 'lg' | 'none' | 'default' | 'responsive';

export type CustomCardShadow = 'none' | 'sm';

export type CustomLinkVariant = 'default' | 'primary';

export type CustomButtonHubVariant = 'cta';

export type CustomTagStatus = 'active' | 'running' | 'draft' | 'error' | 'warning';

export type CustomAlertType = 'info' | 'success' | 'warning' | 'error';

export interface IFormFieldItem {
    name: string;
    label: string;
    type: 'input' | 'select' | 'textarea' | 'switch' | 'code-display' | 'upload';

    span?: number;
    rules?: Rule[];
    hidden?: boolean;
    tooltip?: string;
    disabled?: boolean;
    elementTopRender?: ReactNode;
    elementBottomRender?: ReactNode;
    onChange?: (value: unknown, form?: FormInstance) => void;

    codeProps?: Omit<CodeDisplayProps, 'code' | 'onCodeChange'>;

    inputProps?: {
        placeholder?: string;
        addonAfter?: ReactNode;
        addonBefore?: ReactNode;
    };

    selectProps?: {
        placeholder?: string;
        options?: IOption[];
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
}
