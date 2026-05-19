'use client';

import { Pagination, PaginationProps } from 'antd';

export type CustomPaginationProps = PaginationProps;

export const CustomPagination = (props: CustomPaginationProps) => <Pagination {...props} />;
