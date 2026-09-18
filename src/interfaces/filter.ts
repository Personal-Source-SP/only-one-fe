import { CustomFilterType } from '@/enums';
import { CrudOperators } from '@refinedev/core';
import { ReactNode } from 'react';
import type { IOption } from './forms';

export interface IFilterItem {
    span: number;
    type: CustomFilterType;

    value?: any;
    field?: string;
    title?: string;
    options?: IOption[];
    placeholder?: string;
    showSearch?: boolean;
    allowClear?: boolean;
    mode?: 'multiple' | 'tags';
    operation?: Exclude<CrudOperators, 'or' | 'and'>;

    onChange?: (value: any) => void;
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
