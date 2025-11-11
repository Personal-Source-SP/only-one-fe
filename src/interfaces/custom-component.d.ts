import { Option } from '@/interfaces/common';
import { Rule } from 'antd/es/form';
import { FormInstance } from 'antd/lib';
import { ReactNode } from 'react';

export interface FormFieldItem {
    name: string;
    label: string;
    type: 'input' | 'select' | 'textarea' | 'switch';

    span?: number;
    rules?: Rule[];
    hidden?: boolean;
    tooltip?: string;
    disabled?: boolean;
    placeholder?: string;
    onChange?: (value: any, form?: FormInstance) => void;

    options?: Option[];
    allowClear?: boolean;
    showSearch?: boolean;

    rows?: number;

    addonAfter?: ReactNode;
    addonBefore?: ReactNode;
    elementTopRender?: ReactNode;
    elementBottomRender?: ReactNode;
}
