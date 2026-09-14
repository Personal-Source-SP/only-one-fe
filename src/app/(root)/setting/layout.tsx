import { SectionTabLayout } from '@/components/layout/section-tabs';
import { PropsWithChildren } from 'react';

const SettingLayout = ({ children }: PropsWithChildren) => {
    return <SectionTabLayout>{children}</SectionTabLayout>;
};

export default SettingLayout;
