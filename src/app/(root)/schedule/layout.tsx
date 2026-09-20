import { PropsWithChildren } from 'react';

import { SectionTabLayout } from '@/components/layout/section-tabs';

type ScheduleLayoutProps = PropsWithChildren;

const ScheduleLayout = ({ children }: ScheduleLayoutProps) => {
    return <SectionTabLayout>{children}</SectionTabLayout>;
};

export default ScheduleLayout;
