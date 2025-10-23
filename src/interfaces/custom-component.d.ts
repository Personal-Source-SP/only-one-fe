import { Option } from '@/interfaces/common';
import { Rule } from 'antd/es/form';

export interface FormFieldItem {
    name: string;
    label: string;
    type: 'input' | 'select' | 'textarea';

    span?: number;
    rules?: Rule[];
    disabled?: boolean;
    defaultValue?: any;
    placeholder?: string;
    onChange?: (value: any) => void;

    options?: Option[];
    allowClear?: boolean;
    showSearch?: boolean;

    rows?: number;

    elementTopRender?: React.ReactNode;
    elementBottomRender?: React.ReactNode;
}
