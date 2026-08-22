'use client';

import {
    CustomFlex,
    CustomModal,
    CustomTabs,
    CustomTag,
    CustomTypography,
} from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { getFeatureDefinition } from '@/app/(root)/scraping/features/[dataProviderId]/utils';
import type {
    FeatureModalTab,
    IDataProviderFeature,
} from '@/app/(root)/scraping/features/[dataProviderId]/types';
import { FeatureTestTab } from './FeatureTestTab';
import { FeatureVersionHistoryTab } from './FeatureVersionHistoryTab';

type DataProviderFeatureSettingModalProps = {
    open: boolean;
    activeTab: FeatureModalTab;
    feature: IDataProviderFeature;
    onClose: () => void;
    onSuccess: () => void;
    onTabChange: (tab: FeatureModalTab) => void;
};

export const DataProviderFeatureSettingModal = ({
    open,
    activeTab,
    feature,
    onClose,
    onSuccess,
    onTabChange,
}: DataProviderFeatureSettingModalProps) => {
    const isDraft = !feature.id;
    const providerName = feature.dataProvider?.name;

    const def = getFeatureDefinition(feature.type);
    const ConfigComponent = def?.ConfigComponent;

    const tabItems = [
        {
            key: 'config',
            label: (
                <span className="flex items-center gap-2">
                    <Icon icon="lucide:settings" className="w-4 h-4" />
                    Cấu hình
                </span>
            ),
            children: ConfigComponent ? (
                <ConfigComponent feature={feature} onClose={onClose} onSuccess={onSuccess} />
            ) : (
                <div className="p-6 text-center text-hub-subtitle">
                    Chưa có biểu mẫu cấu hình cho tính năng này.
                </div>
            ),
        },
        ...(!isDraft
            ? [
                  {
                      key: 'test',
                      label: (
                          <span className="flex items-center gap-2">
                              <Icon icon="lucide:flask-conical" className="w-4 h-4" />
                              Thử nghiệm
                          </span>
                      ),
                      children: <FeatureTestTab feature={feature} />,
                  },
                  {
                      key: 'versions',
                      label: (
                          <span className="flex items-center gap-2">
                              <Icon icon="lucide:history" className="w-4 h-4" />
                              Lịch sử phiên bản
                          </span>
                      ),
                      children: (
                          <FeatureVersionHistoryTab
                              feature={feature}
                              onRollbackSuccess={() => {
                                  onSuccess();
                                  onClose();
                              }}
                          />
                      ),
                  },
              ]
            : []),
    ];

    const modalTitle = (
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
                        <CustomTag className="font-mono text-xs m-0">{feature.service}</CustomTag>
                    )}
                </CustomFlex>
            </CustomFlex>
        </CustomFlex>
    );

    return (
        <CustomModal open={open} width={1000} footer={null} onCancel={onClose} title={modalTitle}>
            <CustomTabs
                items={tabItems}
                activeKey={activeTab}
                onChange={(key) => onTabChange(key as FeatureModalTab)}
            />
        </CustomModal>
    );
};
