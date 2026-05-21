import { SectionTabLayout } from '@/components/layout/section-tabs';
import { PropsWithChildren } from 'react';

type ScrapingLayoutProps = PropsWithChildren;

const ScrapingLayout = ({ children }: ScrapingLayoutProps) => {
    return <SectionTabLayout>{children}</SectionTabLayout>;
};

export default ScrapingLayout;
