'use client';

import { Table, TableProps } from 'antd';

export type CustomDataTableProps<T extends object = object> = TableProps<T>;

export const CustomDataTable = <T extends object = object>(props: CustomDataTableProps<T>) => (
    <Table<T> {...props} />
);
