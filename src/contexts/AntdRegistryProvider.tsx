'use client';

import '@ant-design/v5-patch-for-react-19';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { PropsWithChildren } from 'react';

export const AntdRegistryProvider = ({ children }: PropsWithChildren) => (
    <AntdRegistry>{children}</AntdRegistry>
);
