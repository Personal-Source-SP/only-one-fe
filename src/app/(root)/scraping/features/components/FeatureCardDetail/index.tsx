'use client';

import { CustomCard, CustomFlex } from '@/components/custom-antd';
import { FeatureCardActions } from './FeatureCardActions';
import { FeatureCardHeader } from './FeatureCardHeader';
import { FeatureHealthMetrics } from './FeatureHealthMetrics';

export const FeatureCardDetail = () => {
    return (
        <CustomCard
            className="hover:border-hub-primary/60 transition-all duration-200 shadow-sm hover:shadow-md h-full rounded-2xl"
            styles={{
                body: {
                    padding: '20px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                },
            }}
        >
            <CustomFlex vertical className="w-full">
                <FeatureCardHeader />
                <FeatureHealthMetrics />
            </CustomFlex>

            <FeatureCardActions />
        </CustomCard>
    );
};
