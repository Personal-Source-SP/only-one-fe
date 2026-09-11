'use client';

import { useCallback } from 'react';
import { CustomFlex, CustomSwitch, CustomTag, CustomTypography } from '@/components/custom-antd';
import { checkService } from '../../constants';
import { useFeatureModalContext } from '../../context';
import { ConfigVersionType, DataProviderFeatureStatus } from '../../enums';
import { useCurrentService } from '../../hooks';
import { formatDate } from '@/libs';
import { Icon } from '@iconify/react';
import { getFeatureDefinition } from '../../utils';

export const FeatureModalHeader = () => {
    const { feature, isDraft, authorName, selectedVersion, isSwitchingStatus, onSwitchStatus } =
        useFeatureModalContext();

    const activeService = useCurrentService();
    const def = getFeatureDefinition(feature.type);
    const providerName = feature.dataProvider?.name;

    const { label: serviceLabel } = checkService(activeService);

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
                        <CustomTag color="blue" className="font-medium text-xs m-0">
                            {serviceLabel}
                        </CustomTag>
                    </CustomFlex>
                </CustomFlex>
            </CustomFlex>

            <CustomFlex align="center" gap="middle" className="flex-wrap">
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
                                v{selectedVersion.versionId} Active
                            </CustomTag>
                        ) : (
                            <CustomTag color="warning" className="font-mono font-bold m-0">
                                v{selectedVersion.versionId} (Lịch sử)
                            </CustomTag>
                        )}
                    </CustomFlex>
                )}

                {/* Switch Status Toggle */}
                {!isDraft && onSwitchStatus && (
                    <CustomFlex align="center" gap="small">
                        <CustomSwitch
                            checkedChildren="Bật"
                            unCheckedChildren="Tắt"
                            onChange={onSwitchStatus}
                            loading={isSwitchingStatus}
                            disabled={isSwitchingStatus}
                            checked={feature.status === DataProviderFeatureStatus.READY}
                        />
                    </CustomFlex>
                )}
            </CustomFlex>
        </CustomFlex>
    );
};
