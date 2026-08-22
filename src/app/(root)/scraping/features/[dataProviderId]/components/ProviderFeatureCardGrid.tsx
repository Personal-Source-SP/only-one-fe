'use client';

import type {
    FeatureModalTab,
    IDataProviderFeature,
} from '@/app/(root)/scraping/features/[dataProviderId]/types';
import { CustomCol, CustomRow } from '@/components/custom-antd';
import { DataProviderFeatureStatus } from '@/enums';
import { ProviderFeatureCard } from './ProviderFeatureCard';

type ProviderFeatureCardGridProps = {
    features: IDataProviderFeature[];
    onOpenModal: (feature: IDataProviderFeature, tab: FeatureModalTab) => void;
    onSwitchStatus: (featureId: string, currentStatus: DataProviderFeatureStatus) => void;
};

export const ProviderFeatureCardGrid = ({
    features,
    onOpenModal,
    onSwitchStatus,
}: ProviderFeatureCardGridProps) => {
    return (
        <CustomRow gutter={[24, 24]} className="w-full">
            {features.map((feature) => (
                <CustomCol key={feature.id} xs={24} lg={12} className="flex">
                    <ProviderFeatureCard
                        feature={feature}
                        onOpenModal={onOpenModal}
                        onSwitchStatus={onSwitchStatus}
                    />
                </CustomCol>
            ))}
        </CustomRow>
    );
};
