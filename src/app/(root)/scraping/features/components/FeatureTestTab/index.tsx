'use client';

import { CustomCol, CustomRow } from '@/components/custom-antd';
import { FeatureTestProvider } from '../../context';
import { TestInputSection } from './TestInputSection';
import { TestResultSection } from './TestResultSection';

export const FeatureTestTab = () => {
    return (
        <FeatureTestProvider>
            <CustomRow gutter={[16, 16]}>
                <CustomCol xs={24} lg={10}>
                    <TestInputSection />
                </CustomCol>
                <CustomCol xs={24} lg={14}>
                    <TestResultSection />
                </CustomCol>
            </CustomRow>
        </FeatureTestProvider>
    );
};
