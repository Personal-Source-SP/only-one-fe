import { SectionTabLayout } from '@/components/layout/section-tabs';
import { PropsWithChildren } from 'react';

type GoogleLayoutProps = PropsWithChildren;

const GoogleLayout = ({ children }: GoogleLayoutProps) => {
    return <SectionTabLayout>{children}</SectionTabLayout>;
};

export default GoogleLayout;
