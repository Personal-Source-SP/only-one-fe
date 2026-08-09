'use client';

import { App, type AppProps } from 'antd';

export type CustomAppProps = AppProps;

export const CustomApp = (props: CustomAppProps) => <App {...props} />;

export const useCustomApp = App.useApp;
