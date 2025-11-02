import { Option } from '@/interfaces/common';
import { Rule } from 'antd/es/form';
import { FormInstance } from 'antd/lib';

export interface FormFieldItem {
    name: string;
    label: string;
    type: 'input' | 'select' | 'textarea';

    span?: number;
    rules?: Rule[];
    tooltip?: string;
    disabled?: boolean;
    defaultValue?: any;
    placeholder?: string;
    onChange?: (value: any, form?: FormInstance) => void;

    options?: Option[];
    allowClear?: boolean;
    showSearch?: boolean;

    rows?: number;

    elementTopRender?: React.ReactNode;
    elementBottomRender?: React.ReactNode;
}
