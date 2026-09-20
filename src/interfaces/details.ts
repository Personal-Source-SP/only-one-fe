import type {
    ColumnsType,
    CustomDescriptionsProps,
    CustomTabsProps,
    TablePaginationConfig,
    TableProps,
} from '@/components/custom-antd';
import type { ReactNode } from 'react';

export type DetailFormatType =
    'date' | 'datetime' | 'time' | 'tag' | 'badge' | 'boolean' | 'json' | 'currency' | 'number';

export interface IDetailDescriptionItem<TRecord = unknown> {
    name?: keyof TRecord | string | (string | number)[];
    label: ReactNode;
    span?: number;
    format?: DetailFormatType;
    copyable?: boolean;
    strong?: boolean;
    emptyText?: ReactNode;
    tagColor?: string | ((value: unknown, record: TRecord) => string);
    badgeProps?: (
        value: unknown,
        record: TRecord,
    ) => {
        status?: 'success' | 'processing' | 'default' | 'error' | 'warning';
        text?: ReactNode;
    };
    render?: (value: unknown, record: TRecord) => ReactNode;
    visible?: boolean | ((record: TRecord) => boolean);
}

export type DetailSectionType = 'descriptions' | 'table' | 'tabs' | 'card' | 'custom';

export interface IBaseDetailSection<TRecord = unknown> {
    type: DetailSectionType;
    id?: string;
    className?: string;
    visible?: boolean | ((record: TRecord) => boolean);
}

export interface IDescriptionsDetailSection<TRecord = unknown> extends IBaseDetailSection<TRecord> {
    type: 'descriptions';
    items: IDetailDescriptionItem<TRecord>[];
    title?: ReactNode;
    bordered?: boolean;
    size?: CustomDescriptionsProps['size'];
    column?: CustomDescriptionsProps['column'];
    extra?: ReactNode;
    descriptionsProps?: Omit<
        CustomDescriptionsProps,
        'items' | 'title' | 'extra' | 'size' | 'bordered' | 'column'
    >;
}

export interface ITableDetailSection<
    TRecord = unknown,
    TRow extends object = Record<string, unknown>,
> extends IBaseDetailSection<TRecord> {
    type: 'table';
    title?: ReactNode;
    dataSource?: keyof TRecord | string | ((record: TRecord) => TRow[]);
    columns: ColumnsType<TRow>;
    rowKey?: string | ((record: TRow) => string);
    pagination?: TablePaginationConfig | false;
    size?: TableProps<TRow>['size'];
    bordered?: boolean;
    tableProps?: Omit<
        TableProps<TRow>,
        'dataSource' | 'columns' | 'rowKey' | 'pagination' | 'size' | 'bordered'
    >;
}

export interface IDetailTabItem<TRecord = unknown> {
    key: string;
    label: ReactNode;
    icon?: string;
    badge?: ReactNode;
    disabled?: boolean;
    sections?: IDetailSection<TRecord>[];
    children?: ReactNode | ((record: TRecord) => ReactNode);
    visible?: boolean | ((record: TRecord) => boolean);
}

export interface ITabsDetailSection<TRecord = unknown> extends IBaseDetailSection<TRecord> {
    type: 'tabs';
    items: IDetailTabItem<TRecord>[];
    activeKey?: string;
    defaultActiveKey?: string;
    tabsProps?: Omit<CustomTabsProps, 'items' | 'activeKey' | 'defaultActiveKey' | 'onChange'>;
    onChange?: (activeKey: string) => void;
}

export interface ICardDetailSection<TRecord = unknown> extends IBaseDetailSection<TRecord> {
    type: 'card';
    title?: ReactNode;
    description?: ReactNode;
    icon?: string;
    badge?: ReactNode;
    extra?: ReactNode;
    sections?: IDetailSection<TRecord>[];
    children?: ReactNode | ((record: TRecord) => ReactNode);
}

export interface ICustomDetailSection<TRecord = unknown> extends IBaseDetailSection<TRecord> {
    type: 'custom';
    render: (record: TRecord) => ReactNode;
}

export type IDetailSection<TRecord = unknown> =
    | IDescriptionsDetailSection<TRecord>
    | ITableDetailSection<TRecord>
    | ITabsDetailSection<TRecord>
    | ICardDetailSection<TRecord>
    | ICustomDetailSection<TRecord>;
