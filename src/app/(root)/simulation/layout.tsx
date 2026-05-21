import { SectionTabLayout } from '@/components/layout/section-tabs';
import { PropsWithChildren } from 'react';

type SimulationLayoutProps = PropsWithChildren;

const SimulationLayout = ({ children }: SimulationLayoutProps) => {
    return <SectionTabLayout>{children}</SectionTabLayout>;
};

export default SimulationLayout;
