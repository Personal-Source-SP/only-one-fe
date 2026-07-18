import { CodeDisplayProps } from '@/components/common';
import { Option } from '@/interfaces';
import type { FormInstance, Rule } from '@/components/custom';
import { ReactNode } from 'react';

export type CustomCardPadding = 'sm' | 'lg' | 'none' | 'default' | 'responsive';

export type CustomCardShadow = 'none' | 'sm';

export type CustomLinkVariant = 'default' | 'primary';

export type CustomButtonHubVariant = 'cta';

export type CustomTagStatus = 'active' | 'running' | 'draft' | 'error' | 'warning';

export type CustomAlertType = 'info' | 'success' | 'warning' | 'error';

export interface FormFieldItem {
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
}
