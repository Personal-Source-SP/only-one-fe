'use client';

import { CustomFlex, CustomTag, CustomTypography } from '@/components/custom-antd';
import { formatDate } from '@/libs';
import { Icon } from '@iconify/react';
import { useCallback } from 'react';
import { FeatureStatusSelect } from '../FeatureStatusSelect';
import { FEATURE_REGISTRY, SCRAPER_SERVICE_LABELS } from '../../constants';
import { useFeatureModalContext } from '../../context';
import { ConfigVersionType } from '../../enums';

export const FeatureModalHeader = () => {
    const {
        feature,
        isDraft,
        authorName,
        currentService,
        selectedVersion,
        isSwitchingStatus,
        onSwitchStatus,
    } = useFeatureModalContext();

    const def = FEATURE_REGISTRY[feature.type];
    const providerName = feature.dataProvider?.name;
    const serviceLabel = SCRAPER_SERVICE_LABELS[currentService];

    const renderChangeTypeTag = useCallback((changeType?: ConfigVersionType) => {
        if (!changeType) return null;

        let color = 'blue';
        let icon = 'lucide:edit-3';
        let label = 'Chỉnh sửa thủ công';

        switch (changeType) {
            case ConfigVersionType.AI_GENERATED: {
                color = 'purple';
                icon = 'lucide:sparkles';
                label = 'AI tạo';
                break;
            }

            case ConfigVersionType.ROLLBACK: {
                color = 'orange';
                icon = 'lucide:history';
                label = 'Khôi phục';
                break;
            }

            default:
                break;
        }

        return (
            <CustomTag color={color} className="flex items-center gap-1 m-0">
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
                    className={`p-2 rounded-xl shrink-0 ${def.accentClass}`}
                >
                    <Icon icon={def.icon} className="text-lg" />
                </CustomFlex>
                <CustomFlex vertical gap={2}>
                    <CustomFlex align="center" gap="small" wrap>
                        <CustomTypography.Text strong className="text-base text-hub-title">
                            {def.getTitle(isDraft, providerName)}
                        </CustomTypography.Text>
                        <CustomTag color="blue" className="font-medium text-xs m-0">
                            {serviceLabel}
                        </CustomTag>
                    </CustomFlex>
                </CustomFlex>
            </CustomFlex>

            <CustomFlex align="center" gap="small" className="flex-wrap">
                {/* Version Metadata Tags in Header */}
                {!isDraft && selectedVersion && (
                    <CustomFlex align="center" gap="small" wrap>
                        {authorName && (
                            <CustomTag color="default" className="flex items-center gap-1 m-0">
                                <Icon icon="lucide:user" className="w-3 h-3" />
                                {authorName}
                            </CustomTag>
                        )}

                        {renderChangeTypeTag(selectedVersion.changeType)}

                        {selectedVersion.createdAt && (
                            <CustomTag color="default" className="flex items-center gap-1 m-0">
                                <Icon icon="lucide:clock" className="w-3 h-3" />
                                {formatDate(selectedVersion.createdAt)}
                            </CustomTag>
                        )}

                        {selectedVersion.isActive ? (
                            <CustomTag color="success" className="font-mono font-bold m-0">
                                v{selectedVersion.versionId}
                            </CustomTag>
                        ) : (
                            <CustomTag color="warning" className="font-mono font-bold m-0">
                                Phiên bản {selectedVersion.versionId}
                            </CustomTag>
                        )}
                    </CustomFlex>
                )}

                {/* Switch Status Toggle */}
                {!isDraft && onSwitchStatus && (
                    <CustomFlex align="center" gap="small">
                        <FeatureStatusSelect
                            status={feature.status}
                            onChange={onSwitchStatus}
                            loading={isSwitchingStatus}
                            disabled={isSwitchingStatus}
                        />
                    </CustomFlex>
                )}
            </CustomFlex>
        </CustomFlex>
    );
};
