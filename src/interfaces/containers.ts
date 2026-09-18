import type {
    CustomPicker,
    InputProps,
    MenuProps,
    SegmentedProps,
    SelectProps,
} from '@/components/custom-antd';
import type { Dayjs } from 'dayjs';
import type { ComponentProps, Key, MouseEvent, ReactNode } from 'react';
import type { IFieldFormConfig } from './forms';

// --- Field & Metadata Config ---
export interface IFieldTableConfig {
    title?: string;
    sorter?: boolean;
    hsidden?: boolean;
    ellipsis?: boolean;
    width?: string | number;
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

// --- Filters Contract ---
export type FilterValue =
    string | number | boolean | string[] | number[] | [Dayjs, Dayjs] | null | undefined;

export type FilterType = 'input' | 'select' | 'dateRange' | 'segmented';

export interface IFilterOption {
    label: ReactNode;
    value: string | number | null | undefined;
}

export interface IFilterField {
    name: string;
    type: FilterType;
    label?: ReactNode;
    value?: FilterValue;
    className?: string;
    isPrimary?: boolean;
    enableDateRangePresets?: boolean;
    placeholder?: string | [string, string];
    onChange?: (value: FilterValue) => void;

    options?: IFilterOption[];
    inputProps?: InputProps;
    selectProps?: SelectProps;
    segmentedProps?: SegmentedProps;
    rangePickerProps?: ComponentProps<typeof CustomPicker.RangePicker>;
}

// --- List Table Custom Action ---
export interface TableCustomAction<RecordType> {
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
export type ActionMenuItem = NonNullable<MenuProps['items']>[number] & {
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
