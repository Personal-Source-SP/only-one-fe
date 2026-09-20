import { PropsWithChildren } from 'react';

import { SectionTabLayout } from '@/components/layout/section-tabs';

type CloudDataLayoutProps = PropsWithChildren;

const CloudDataLayout = ({ children }: CloudDataLayoutProps) => {
    return <SectionTabLayout>{children}</SectionTabLayout>;
};

export default CloudDataLayout;
