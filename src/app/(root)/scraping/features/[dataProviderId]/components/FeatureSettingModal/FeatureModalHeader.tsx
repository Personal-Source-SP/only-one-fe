'use client';

import { useCallback } from 'react';
import { CustomFlex, CustomTag, CustomTypography } from '@/components/custom-antd';
import { ConfigVersionType } from '../../enums';
import { formatDate } from '@/libs';
import { Icon } from '@iconify/react';
import type { IConfigVersion, IDataProviderFeature } from '../../types';
import { getFeatureDefinition } from '../../utils';

export interface FeatureModalHeaderProps {
    isDraft: boolean;
    feature: IDataProviderFeature;
    authorName: string | null;
    selectedVersion: IConfigVersion | null;
}

export const FeatureModalHeader = ({
    isDraft,
    feature,
    authorName,
    selectedVersion,
}: FeatureModalHeaderProps) => {
    const def = getFeatureDefinition(feature.type);
    const providerName = feature.dataProvider?.name;

    const renderChangeTypeTag = useCallback((changeType?: ConfigVersionType) => {
        if (!changeType) return null;

        let label = 'Chỉnh sửa thủ công';
        let icon = 'lucide:edit-3';

        switch (changeType) {
            case ConfigVersionType.AI_GENERATED:
                label = 'AI tạo';
                icon = 'lucide:sparkles';
                break;
            case ConfigVersionType.ROLLBACK:
                label = 'Khôi phục';
                icon = 'lucide:history';
                break;
            default:
                break;
        }

        return (
            <CustomTag color="#108ee9" className="flex items-center gap-1 m-0">
                <Icon icon={icon} className="w-3 h-3" />
                {label}
            </CustomTag>
        );
    }, []);

    return (
        <CustomFlex justify="space-between" align="center" className="w-full pr-6 flex-wrap gap-2">
            <CustomFlex align="center" gap="middle">
                <CustomFlex
                    align="center"
                    justify="center"
                    className={`p-2 rounded-xl shrink-0 ${
                        def?.accentClass || 'text-hub-primary bg-hub-primary/10'
                    }`}
                >
                    <Icon icon={def?.icon || 'lucide:sliders'} className="text-lg" />
                </CustomFlex>
                <CustomFlex vertical gap={2}>
                    <CustomFlex align="center" gap="small" wrap>
                        <CustomTypography.Text strong className="text-base text-hub-title">
                            {def?.getTitle
                                ? def.getTitle(isDraft, providerName)
                                : `${isDraft ? 'Thiết lập' : 'Cấu hình'}: ${feature.type}`}
                        </CustomTypography.Text>
                        {feature.service && (
                            <CustomTag className="font-mono text-xs m-0">
                                {feature.service}
                            </CustomTag>
                        )}
                    </CustomFlex>
                </CustomFlex>
            </CustomFlex>

            {/* Version Metadata Tags in Header */}
            {!isDraft && selectedVersion && (
                <CustomFlex align="center" gap="small" wrap>
                    {authorName && (
                        <CustomTag color="#108ee9" className="flex items-center gap-1 m-0">
                            <Icon icon="lucide:user" className="w-3 h-3" />
                            {authorName}
                        </CustomTag>
                    )}

                    {renderChangeTypeTag(selectedVersion.changeType)}

                    {selectedVersion.createdAt && (
                        <CustomTag color="#108ee9" className="flex items-center gap-1 m-0">
                            <Icon icon="lucide:clock" className="w-3 h-3" />
                            {formatDate(selectedVersion.createdAt)}
                        </CustomTag>
                    )}

                    {selectedVersion.isActive ? (
                        <CustomTag color="success" className="font-mono font-bold m-0">
                            v{selectedVersion.versionId} Active
                        </CustomTag>
                    ) : (
                        <CustomTag color="warning" className="font-mono font-bold m-0">
                            v{selectedVersion.versionId} (Lịch sử)
                        </CustomTag>
                    )}
                </CustomFlex>
            )}
        </CustomFlex>
    );
};
