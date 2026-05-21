import { SectionTabLayout } from '@/components/layout/section-tabs';
import { PropsWithChildren } from 'react';

type CloudDataLayoutProps = PropsWithChildren;

const CloudDataLayout = ({ children }: CloudDataLayoutProps) => {
    return <SectionTabLayout>{children}</SectionTabLayout>;
};

export default CloudDataLayout;
