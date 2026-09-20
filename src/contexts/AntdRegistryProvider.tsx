'use client';

import { PropsWithChildren } from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';

import '@ant-design/v5-patch-for-react-19';

export const AntdRegistryProvider = ({ children }: PropsWithChildren) => (
    <AntdRegistry>{children}</AntdRegistry>
);
