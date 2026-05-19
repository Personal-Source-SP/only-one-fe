'use client';

import { Popconfirm, PopconfirmProps } from 'antd';

export type CustomPopconfirmProps = PopconfirmProps;

export const CustomPopconfirm = (props: CustomPopconfirmProps) => <Popconfirm {...props} />;
