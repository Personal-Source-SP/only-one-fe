import type { CustomPicker, InputProps, SegmentedProps, SelectProps } from '@/components';
import { CustomFilterType } from '@/enums';
import type { IOption } from '@/interfaces';
import { CrudOperators } from '@refinedev/core';
import type { Dayjs } from 'dayjs';
import type { ComponentProps, ReactNode } from 'react';

// ==========================================
// BREADCRUMB CONTRACTS
// ==========================================

export interface IBreadcrumbItem {
    label: ReactNode;
    key?: string;
    href?: string;
    icon?: ReactNode;
    iconName?: string;
    separator?: ReactNode;
    onClick?: () => void;
}

export type { IBreadcrumbItem as BreadcrumbItem };

export type BreadcrumbNavProps = {
    className?: string;
    separator?: ReactNode;
    items?: IBreadcrumbItem[];
};

// ==========================================
// FILTER CONTRACTS
// ==========================================

export type IFilterValue =
    string | number | boolean | string[] | number[] | [Dayjs, Dayjs] | null | undefined;

export type FilterType = 'input' | 'select' | 'dateRange' | 'segmented';

export type IFilterOption = IOption<string | number | null | undefined, ReactNode>;
export type { IFilterOption as FilterOption };

export interface IFilterField {
    name: string;
    type: FilterType;
    label?: ReactNode;
    value?: IFilterValue;
    className?: string;
    isPrimary?: boolean;
    enableDateRangePresets?: boolean;
    placeholder?: string | [string, string];
    onChange?: (value: IFilterValue) => void;

    options?: IFilterOption[];
    inputProps?: InputProps;
    selectProps?: SelectProps;
    segmentedProps?: SegmentedProps;
    rangePickerProps?: ComponentProps<typeof CustomPicker.RangePicker>;
}

export interface IFilterItem {
    span: number;
    type: CustomFilterType;

    value?: unknown;
    field?: string;
    title?: string;
    options?: IOption[];
    placeholder?: string;
    showSearch?: boolean;
    allowClear?: boolean;
    mode?: 'multiple' | 'tags';
    operation?: Exclude<CrudOperators, 'or' | 'and'>;

    onChange?(value: unknown): void;
}

export type FilterPanelProps = {
    fields: IFilterField[];
    className?: string;
    mobileModalTitle?: ReactNode;
    mobileDrawerTitle?: ReactNode;
    enableMobileModal?: boolean;
    enableMobileDrawer?: boolean;
    extraActions?: ReactNode;
    onResetFilters?: () => void;
};

// ==========================================
// ACTION & HEADER CONTRACTS
// ==========================================

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

export type ListHeaderProps = {
    withCard?: boolean;
    className?: string;
    allowedActions?: ICardAction[];
    mobileActionsButton?: ReactNode;
    filters?: IFilterField[] | ReactNode;
};

// ==========================================
// LIST CONTAINER CONTRACTS
// ==========================================

export type ListContainerProps = {
    withCard?: boolean;
    className?: string;
    isLoading?: boolean;
    top?: ReactNode;
    children?: ReactNode;
    bottom?: ReactNode;
    actions?: ICardAction[];
    permissionGroup?: string;
    breadcrumb?: IBreadcrumbItem[];
    mobileActionsTitle?: ReactNode;
    filters?: IFilterField[] | ReactNode;
};

export type ListWrapperProps = ListContainerProps;
