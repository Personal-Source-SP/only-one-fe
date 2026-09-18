import type { FormRuleConfig } from '@/utilities';

export type FormFieldType =
    'input' | 'number' | 'password' | 'textarea' | 'select' | 'switch' | 'custom';

export interface IAbstract {
    id: string;
    createdAt?: Date;
    createdBy?: string | null;
    updatedBy?: string | null;
    updatedAt?: Date;
    deletedBy?: string | null;
    deletedAt?: Date | null;
}

export interface IFieldTableConfig {
    title?: string;
    width?: string | number;
    sorter?: boolean;
    ellipsis?: boolean;
    hidden?: boolean;
}

export interface IFieldFormConfig {
    type?: FormFieldType;
    placeholder?: string;
    rulesConfig?: FormRuleConfig[];
    colSpan?: number;
}

export interface IFieldMetadata<TKey extends string = string> {
    key: TKey;
    label: string;
    description?: string;
    table?: IFieldTableConfig;
    form?: IFieldFormConfig;
}

export interface IOption<T = string | number> {
    value: T;
    label: string;
    key?: string;
}

export interface IPaginationRequest {
    page?: number;
    limit?: number;
    filter?: string;
    sortBy?: string[];
}

export interface IErrorItem {
    code: string;
    message?: string;
}

export type ApiError = string | IErrorItem | IErrorItem[];
