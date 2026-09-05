'use client';

import { useCallback, useMemo } from 'react';
import { CustomCard, CustomFlex } from '@/components/custom-antd';
import { DataProviderFeatureStatus } from '../../enums';
import { FEATURE_TYPE_METADATA } from '../../constants';
import type { FeatureModalTab, IDataProviderFeature } from '../../types';
import { FeatureCardActions } from './FeatureCardActions';
import { FeatureCardHeader } from './FeatureCardHeader';
import { FeatureHealthMetrics } from './FeatureHealthMetrics';

export type FeatureCardProps = {
    feature: IDataProviderFeature;
    onOpenModal: (feature: IDataProviderFeature, tab: FeatureModalTab) => void;
    onOpenHistoryModal: (feature: IDataProviderFeature) => void;
    onSwitchStatus: (featureId: string, currentStatus: DataProviderFeatureStatus) => void;
};

export const FeatureCard = ({
    feature,
    onOpenModal,
    onOpenHistoryModal,
    onSwitchStatus,
}: FeatureCardProps) => {
    const meta = useMemo(() => FEATURE_TYPE_METADATA[feature.type], [feature.type]);

    const isReady = useMemo(
        () => feature.status === DataProviderFeatureStatus.READY,
        [feature.status],
    );

    const isError = useMemo(
        () => feature.status === DataProviderFeatureStatus.ERROR || feature.consecutiveFailures > 0,
        [feature.status, feature.consecutiveFailures],
    );

    const handleSwitchStatus = useCallback(
        () => onSwitchStatus(feature.id, feature.status),
        [onSwitchStatus, feature.id, feature.status],
    );

    const handleOpenConfig = useCallback(
        () => onOpenModal(feature, 'config'),
        [onOpenModal, feature],
    );

    const handleOpenTest = useCallback(() => onOpenModal(feature, 'test'), [onOpenModal, feature]);

    const handleOpenHistory = useCallback(
        () => onOpenHistoryModal(feature),
        [onOpenHistoryModal, feature],
    );

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
                <FeatureCardHeader
                    meta={meta}
                    feature={feature}
                    isReady={isReady}
                    onSwitchStatus={handleSwitchStatus}
                />

                <FeatureHealthMetrics feature={feature} isReady={isReady} isError={isError} />
            </CustomFlex>

            <FeatureCardActions
                onOpenConfig={handleOpenConfig}
                onOpenTest={handleOpenTest}
                onOpenHistory={handleOpenHistory}
            />
        </CustomCard>
    );
};
