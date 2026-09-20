import { PropsWithChildren } from 'react';

import { SectionTabLayout } from '@/components/layout/section-tabs';

type ScrapingLayoutProps = PropsWithChildren;

const ScrapingLayout = ({ children }: ScrapingLayoutProps) => {
    return <SectionTabLayout>{children}</SectionTabLayout>;
};

export default ScrapingLayout;
