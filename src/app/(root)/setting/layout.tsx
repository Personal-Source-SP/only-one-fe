import { SectionTabLayout } from '@/components/layout/section-tabs';
import { PropsWithChildren } from 'react';

type SettingLayoutProps = PropsWithChildren;

const SettingLayout = ({ children }: SettingLayoutProps) => {
    return <SectionTabLayout>{children}</SectionTabLayout>;
};

export default SettingLayout;
