'use client';

import type { FC, JSX } from 'react';
import { DataProviderFeatureStatus, DataProviderFeatureType } from '@/enums';
import { Icon } from '@iconify/react';
import { ProviderFeatureCard } from './ProviderFeatureCard';
import type {
    FeatureModalTab,
    IDataProviderFeature,
} from '@/app/(root)/scraping/features/[dataProviderId]/types';

interface ProviderFeatureCardGridProps {
    features: IDataProviderFeature[];
    onSwitchStatus: (featureId: string, currentStatus: DataProviderFeatureStatus) => void;
    onOpenModal: (feature: IDataProviderFeature, tab: FeatureModalTab) => void;
    onAddFeature: (type?: DataProviderFeatureType) => void;
}

export const ProviderFeatureCardGrid: FC<ProviderFeatureCardGridProps> = ({
    features,
    onSwitchStatus,
    onOpenModal,
    onAddFeature,
}): JSX.Element => {
    const existingTypes = features.map((f) => f.type);
    const missingTypes = [DataProviderFeatureType.SCRAPING, DataProviderFeatureType.SEARCH].filter(
        (t) => !existingTypes.includes(t),
    );

    const hasMissingFeature = missingTypes.length > 0;
    const firstMissingType = missingTypes[0];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {features.map((feature) => (
                <ProviderFeatureCard
                    key={feature.id}
                    feature={feature}
                    onSwitchStatus={onSwitchStatus}
                    onOpenModal={onOpenModal}
                />
            ))}

            {hasMissingFeature && (
                <button
                    type="button"
                    onClick={() => onAddFeature(firstMissingType)}
                    className="border-2 border-dashed border-hub-border/80 hover:border-hub-primary/80 transition-colors rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3 group min-h-[260px] bg-hub-section/10 hover:bg-hub-section/30 cursor-pointer"
                >
                    <div className="p-3 rounded-full bg-hub-section border border-hub-border group-hover:bg-hub-primary/10 group-hover:border-hub-primary/30 transition-all">
                        <Icon
                            icon="lucide:plus"
                            className="w-6 h-6 text-hub-subtitle group-hover:text-hub-primary"
                        />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-hub-title group-hover:text-hub-primary">
                            {firstMissingType === DataProviderFeatureType.SEARCH
                                ? 'Thiết lập tính năng Tìm kiếm'
                                : 'Thiết lập tính năng Cào dữ liệu'}
                        </h4>
                        <p className="text-xs text-hub-subtitle mt-0.5">
                            Bấm để cấu hình và kích hoạt tính năng trực tiếp
                        </p>
                    </div>
                </button>
            )}
        </div>
    );
};
