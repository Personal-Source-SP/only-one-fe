'use client';

import type { FormInstance } from '@/components/custom-antd';
import type { FormMode } from '@/hooks';
import type { FormFieldType, IFormField } from '@/interfaces';

export type { FormFieldType, IFormField };
export type {
    IBaseFormField,
    IInputFormField,
    INumberFormField,
    IPasswordFormField,
    ITextAreaFormField,
    ISelectFormField,
    ISwitchFormField,
    ICustomFormField,
} from '@/interfaces';

export type CustomFormFieldProps<TValues = unknown> = {
    mode: FormMode;
    withCol?: boolean;
    field: IFormField<TValues>;
    form?: FormInstance<TValues>;
};
