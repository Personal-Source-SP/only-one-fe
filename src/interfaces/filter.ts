import { CustomFilterType } from '@/enums';
import { CrudOperators } from '@refinedev/core';
import { ReactNode } from 'react';
import { IOption } from './common';

export interface IFilterItem {
    span: number;
    type: CustomFilterType;

    value?: any;
    title?: string;
    options?: IOption[];
    placeholder?: string;
    showSearch?: boolean;
    allowClear?: boolean;
    mode?: 'multiple' | 'tags';

    field?: string;
    onChange?: (value: any) => void;
    operation?: Exclude<CrudOperators, 'or' | 'and'>;
}

export interface IActionTableItem {
    key: string;
    label: string;
    icon: ReactNode;
    onClick: (record: any) => void;
}

export interface ISearchFilterItem {
    name?: string;
    span?: number;
    placeholder?: string;
}
