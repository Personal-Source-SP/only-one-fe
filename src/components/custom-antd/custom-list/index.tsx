'use client';

import { List, ListProps } from 'antd';

export type CustomListProps<T> = ListProps<T>;

export const CustomList = Object.assign(<T,>(props: CustomListProps<T>) => <List<T> {...props} />, {
    Item: List.Item,
}) as typeof List;
