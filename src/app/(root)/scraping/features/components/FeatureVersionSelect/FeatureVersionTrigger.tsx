'use client';

import { CustomButton, CustomFlex, type CustomButtonProps } from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import type { IConfigVersion } from '../../types';
import { useMemo } from 'react';

export type FeatureVersionTriggerProps = Omit<CustomButtonProps, 'children'> & {
    hasMultipleVersions?: boolean;
    version?: IConfigVersion | null;
};

export const FeatureVersionTrigger = ({
    loading = false,
    disabled = false,
    className = '',
    hasMultipleVersions = true,
    version,
    ...props
}: FeatureVersionTriggerProps) => {
    const versionLabel = useMemo(() => {
        if (!version) return 'Phiên bản';

        return version.isActive
            ? `Phiên bản hiện tại (v${version.versionId})`
            : `Phiên bản ${version.versionId}`;
    }, [version]);

    return (
        <CustomButton
            loading={loading}
            disabled={disabled}
            className={`!h-[40px] px-3.5 rounded-lg border font-medium text-sm transition-all shadow-sm flex items-center justify-center bg-hub-surface border-hub-border text-hub-title hover:border-hub-primary hover:text-hub-primary ${className}`}
            {...props}
        >
            <CustomFlex align="center" gap={8}>
                <Icon icon="lucide:history" className="text-sm text-hub-primary shrink-0" />
                <span className="font-semibold">{versionLabel}</span>
                {!loading && hasMultipleVersions && (
                    <Icon icon="lucide:chevron-down" className="text-sm opacity-70 ml-0.5" />
                )}
            </CustomFlex>
        </CustomButton>
    );
};
