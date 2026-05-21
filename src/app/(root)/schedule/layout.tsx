import { SectionTabLayout } from '@/components/layout/section-tabs';
import { PropsWithChildren } from 'react';

type ScheduleLayoutProps = PropsWithChildren;

const ScheduleLayout = ({ children }: ScheduleLayoutProps) => {
    return <SectionTabLayout>{children}</SectionTabLayout>;
};

export default ScheduleLayout;
