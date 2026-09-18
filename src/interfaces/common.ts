export interface IAbstract {
    id: string;
    createdAt?: Date;
    createdBy?: string | null;
    updatedBy?: string | null;
    updatedAt?: Date;
    deletedBy?: string | null;
    deletedAt?: Date | null;
}

export interface IFieldMetadata<TKey extends string = string> {
    key: TKey;
    label: string;
    tableTitle?: string;
    placeholder?: string;
    width?: string | number;
    maxLength?: number;
    minLength?: number;
    requiredMessage?: string;
    messages?: Record<string, string>;
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
