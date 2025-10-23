import { CustomFilterType } from '@/enums';

export interface Abstract {
    id?: string;
    createdAt?: Date;
    createdBy?: string | null;
    updatedBy?: string | null;
    updatedAt?: Date;
    deletedBy?: string | null;
    deletedAt?: Date | null;
}

export interface SidebarItem {
    label: string;
    icon: string;
    href?: string;
    checkAdmin?: boolean;
    children?: SidebarItem[];
}

export interface Option {
    label: string;
    key?: string;
    value?: string | number;
}

export interface PaginationRequest {
    page?: number;
    limit?: number;
    filter?: string;
    sortBy?: string[];
}

export interface FilterItem {
    span: number;
    type: CustomFilterType;

    value?: any;
    title?: string;
    options?: Option[];
    placeholder?: string;
    showSearch?: boolean;
    allowClear?: boolean;
    mode?: 'multiple' | 'tags';
    onChange?: (value: any) => void;
}

export interface ActionTableItem {
    key: string;
    label: string;
    icon: React.ReactNode;
    onClick: (record: any) => void;
}

export interface SearchFilterItem {
    name?: string;
    span?: number;
    placeholder?: string;
}
