'use client';

import { ConfigProvider, type ConfigProviderProps } from 'antd';

export type CustomConfigProviderProps = ConfigProviderProps;

export const CustomConfigProvider = (props: CustomConfigProviderProps) => (
    <ConfigProvider {...props} />
);

export * from './HubThemedConfigProvider';
