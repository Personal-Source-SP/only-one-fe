import { PropsWithChildren } from 'react';

import { SectionTabLayout } from '@/components/layout/section-tabs';

type SimulationLayoutProps = PropsWithChildren;

const SimulationLayout = ({ children }: SimulationLayoutProps) => {
    return <SectionTabLayout>{children}</SectionTabLayout>;
};

export default SimulationLayout;
