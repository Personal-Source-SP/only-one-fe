'use client';

import { CustomModal, CustomTabs } from '@/components/custom-antd';
import { DataProviderFeatureType } from '@/enums';
import { Icon } from '@iconify/react';
import type {
    FeatureModalTab,
    IDataProviderFeature,
} from '@/app/(root)/scraping/features/[dataProviderId]/types';
import { FeatureTestTab } from './FeatureTestTab';
import { FeatureVersionHistoryTab } from './FeatureVersionHistoryTab';
import { ScrapingConfigForm } from './ScrapingConfigForm';
import { SearchConfigForm } from './SearchConfigForm';

type DataProviderFeatureSettingModalProps = {
    open: boolean;
    feature: IDataProviderFeature;
    activeTab: FeatureModalTab;
    onTabChange: (tab: FeatureModalTab) => void;
    onClose: () => void;
    onSuccess: () => void;
};

export const DataProviderFeatureSettingModal = ({
    open,
    feature,
    activeTab,
    onTabChange,
    onClose,
    onSuccess,
}: DataProviderFeatureSettingModalProps) => {
    const isScraping = feature.type === DataProviderFeatureType.SCRAPING;
    const isDraft = !feature.id;

    const tabItems = [
        {
            key: 'config',
            label: (
                <span className="flex items-center gap-2">
                    <Icon icon="lucide:settings" className="w-4 h-4" />
                    Cấu hình
                </span>
            ),
            children: isScraping ? (
                <ScrapingConfigForm feature={feature} onSuccess={onSuccess} onClose={onClose} />
            ) : (
                <SearchConfigForm feature={feature} onSuccess={onSuccess} onClose={onClose} />
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

    return (
        <CustomModal
            open={open}
            onCancel={onClose}
            footer={null}
            width={1000}
            title={
                <div className="flex items-center gap-2 text-base font-semibold">
                    <Icon icon="lucide:sliders" className="text-hub-primary text-xl" />
                    <span>
                        {`${isDraft ? 'Thiết lập tính năng' : 'Cấu hình tính năng'}: ${
                            isScraping ? 'Cào dữ liệu (Scraping)' : 'Tìm kiếm (Search)'
                        } ${feature.dataProvider?.name ? `(${feature.dataProvider.name})` : ''}`}
                    </span>
                </div>
            }
        >
            <CustomTabs
                activeKey={activeTab}
                onChange={(key) => onTabChange(key as FeatureModalTab)}
                items={tabItems}
            />
        </CustomModal>
    );
};
