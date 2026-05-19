'use client';

import { Breadcrumb, BreadcrumbProps } from 'antd';

export type CustomBreadcrumbProps = BreadcrumbProps;

export const CustomBreadcrumb = (props: CustomBreadcrumbProps) => <Breadcrumb {...props} />;
