import type { MenuProps } from '@/components/custom-antd';
import type { Key, MouseEvent, ReactNode } from 'react';
import type { IFieldFormConfig } from './forms';

export interface IFieldTableConfig {
    title?: string;
    sorter?: boolean;
    hidden?: boolean;
    ellipsis?: boolean;
    width?: string | number;
    align?: 'left' | 'right' | 'center';
}

export interface IFieldMetadata<TKey extends string = string> {
    key: TKey;
    label: string;
    description?: string;
    form?: IFieldFormConfig;
    table?: IFieldTableConfig;
}

// --- Breadcrumb Contract ---
export interface IBreadcrumbItem {
    label: ReactNode;
    key?: string;
    href?: string;
    icon?: ReactNode;
    iconName?: string;
    separator?: ReactNode;
    onClick?: () => void;
}

// --- List Table Custom Action ---
export interface ITableCustomAction<RecordType> {
    key: string;
    icon?: ReactNode;
    tooltip?: string;
    danger?: boolean;
    keepOpen?: boolean;
    width?: number | string;
    allowedRoles?: string[];
    show?: boolean | ((record: RecordType) => boolean);

    onClick: (record: RecordType) => void;
    render?: (record: RecordType, closeDropdown: () => void) => ReactNode;
}

// --- Mobile Card List Menu Item ---
export type IActionMenuItem = NonNullable<MenuProps['items']>[number] & {
    key?: Key;
    icon?: ReactNode;
    danger?: boolean;
    label?: ReactNode;
    onClick?: (info?: { domEvent?: MouseEvent<HTMLElement>; key?: Key }) => void;
};

// --- Header Action Contract ---
export type ICardActionPermission = 'create' | 'update' | 'delete' | 'read';

export interface ICardAction {
    key?: string;
    danger?: boolean;
    icon?: ReactNode;
    label?: ReactNode;
    component?: ReactNode;
    permissionAction?: ICardActionPermission;
    onClick?: () => void;
}
