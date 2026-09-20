import { PropsWithChildren } from 'react';

import { SectionTabLayout } from '@/components/layout/section-tabs';

type GoogleLayoutProps = PropsWithChildren;

const GoogleLayout = ({ children }: GoogleLayoutProps) => {
    return <SectionTabLayout>{children}</SectionTabLayout>;
};

export default GoogleLayout;
