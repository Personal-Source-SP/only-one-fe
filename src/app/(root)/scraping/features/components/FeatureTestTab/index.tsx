'use client';

import { CustomCol, CustomRow } from '@/components';

import { FeatureTestProvider } from '../../context';
import { TestInputSection } from './TestInputSection';
import { TestResultSection } from './TestResultSection';

export const FeatureTestTab = () => {
    return (
        <FeatureTestProvider>
            <CustomRow gutter={[16, 16]}>
                <CustomCol span={24}>
                    <TestInputSection />
                </CustomCol>
                <CustomCol span={24}>
                    <TestResultSection />
                </CustomCol>
            </CustomRow>
        </FeatureTestProvider>
    );
};
