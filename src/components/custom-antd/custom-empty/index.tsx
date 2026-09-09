'use client';

import { Empty, EmptyProps } from 'antd';

export type CustomEmptyProps = EmptyProps;

export const CustomEmpty = (props: CustomEmptyProps) => <Empty {...props} />;
