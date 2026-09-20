import { PropsWithChildren } from 'react';

import { SectionTabLayout } from '@/components/layout/section-tabs';

const SettingLayout = ({ children }: PropsWithChildren) => {
    return <SectionTabLayout>{children}</SectionTabLayout>;
};

export default SettingLayout;
