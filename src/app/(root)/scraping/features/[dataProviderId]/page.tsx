'use client';

import type { FC, JSX } from 'react';
import { ListWrapper } from '@/components/common';
import { CustomButton, CustomDropdown } from '@/components/custom-antd';
import { DataProviderFeatureType } from '@/enums';
import { Icon } from '@iconify/react';
import {
    DataProviderFeatureSettingModal,
    ProviderFeatureCardGrid,
    ProviderFeaturesHeader,
} from './components';
import { useDataProviderFeaturesPage } from './hooks';
import type { FeatureModalTab } from './types';

const DataProviderFeaturesPage: FC = (): JSX.Element => {
    const {
        provider,
        features,
        isLoading,
        modalState,
        openFeatureModal,
        openConfigByType,
        closeFeatureModal,
        setModalState,
        handleSwitchStatus,
        refetchAll,
        router,
    } = useDataProviderFeaturesPage();

    const isScrapingConfigured = features.some((f) => f.type === DataProviderFeatureType.SCRAPING);
    const isSearchConfigured = features.some((f) => f.type === DataProviderFeatureType.SEARCH);

    const settingMenuItems = [
        {
            key: DataProviderFeatureType.SCRAPING,
            label: (
                <div className="flex items-center gap-3 py-1 px-1">
                    <div className="p-1.5 rounded-lg bg-hub-primary/10 text-hub-primary shrink-0">
                        <Icon icon="lucide:file-code" className="text-base" />
                    </div>
                    <div>
                        <div className="font-semibold text-hub-title text-sm">
                            Cào dữ liệu (Scraping)
                        </div>
                        <div className="text-xs text-hub-subtitle">
                            {isScrapingConfigured
                                ? 'Đã khởi tạo • Bấm để chỉnh sửa cấu hình'
                                : 'Chưa khởi tạo • Bấm để thiết lập cấu hình'}
                        </div>
                    </div>
                </div>
            ),
            onClick: () => openConfigByType(DataProviderFeatureType.SCRAPING),
        },
        {
            key: DataProviderFeatureType.SEARCH,
            label: (
                <div className="flex items-center gap-3 py-1 px-1">
                    <div className="p-1.5 rounded-lg bg-hub-primary/10 text-hub-primary shrink-0">
                        <Icon icon="lucide:search" className="text-base" />
                    </div>
                    <div>
                        <div className="font-semibold text-hub-title text-sm">
                            Tìm kiếm (Search)
                        </div>
                        <div className="text-xs text-hub-subtitle">
                            {isSearchConfigured
                                ? 'Đã khởi tạo • Bấm để chỉnh sửa cấu hình'
                                : 'Chưa khởi tạo • Bấm để thiết lập cấu hình'}
                        </div>
                    </div>
                </div>
            ),
            onClick: () => openConfigByType(DataProviderFeatureType.SEARCH),
        },
    ];

    return (
        <ListWrapper isLoading={isLoading}>
            <div className="space-y-6">
                <ProviderFeaturesHeader
                    provider={provider}
                    onBack={() => router.push('/scraping/data-providers')}
                />

                {/* Section Header & Actions */}
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-hub-title flex items-center gap-2">
                            <Icon icon="lucide:layers" className="text-hub-primary" />
                            <span>Các tính năng hoạt động</span>
                        </h2>
                        <p className="text-xs text-hub-subtitle mt-0.5">
                            Quản lý trạng thái, cấu hình và lịch sử thực thi của các tính năng trực
                            thuộc nhà cung cấp này
                        </p>
                    </div>

                    <CustomDropdown
                        menu={{ items: settingMenuItems }}
                        trigger={['click']}
                        placement="bottomRight"
                    >
                        <CustomButton
                            type="primary"
                            icon={<Icon icon="lucide:settings-2" className="text-base" />}
                        >
                            <span>Thêm cài đặt</span>
                            <Icon icon="lucide:chevron-down" className="ml-1 text-xs" />
                        </CustomButton>
                    </CustomDropdown>
                </div>

                {/* Feature Card Grid */}
                <ProviderFeatureCardGrid
                    features={features}
                    onSwitchStatus={handleSwitchStatus}
                    onOpenModal={openFeatureModal}
                    onAddFeature={(type) =>
                        openConfigByType(type || DataProviderFeatureType.SCRAPING)
                    }
                />

                {/* Setting Modal */}
                {modalState.open && modalState.feature && (
                    <DataProviderFeatureSettingModal
                        open={modalState.open}
                        feature={modalState.feature}
                        activeTab={modalState.activeTab}
                        onTabChange={(tab: FeatureModalTab) =>
                            setModalState((prev) => ({ ...prev, activeTab: tab }))
                        }
                        onClose={closeFeatureModal}
                        onSuccess={refetchAll}
                    />
                )}
            </div>
        </ListWrapper>
    );
};

export default DataProviderFeaturesPage;
