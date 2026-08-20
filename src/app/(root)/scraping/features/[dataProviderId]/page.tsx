'use client';

import type { FC, JSX } from 'react';
import { ListWrapper } from '@/components/common';
import { CustomButton } from '@/components/custom-antd';
import { DataProviderFeatureType } from '@/enums';
import { Icon } from '@iconify/react';
import {
    CreateFeatureModal,
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
        createModalState,
        openFeatureModal,
        closeFeatureModal,
        setModalState,
        setCreateModalState,
        handleSwitchStatus,
        refetchAll,
        dataProviderId,
        router,
    } = useDataProviderFeaturesPage();

    const existingTypes = features.map((f) => f.type);
    const availableTypes = [
        DataProviderFeatureType.SCRAPING,
        DataProviderFeatureType.SEARCH,
    ].filter((t) => !existingTypes.includes(t));

    const handleOpenAddFeature = () => {
        setCreateModalState({ open: true, availableTypes });
    };

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

                    {availableTypes.length > 0 && (
                        <CustomButton
                            type="primary"
                            icon={<Icon icon="lucide:plus" />}
                            onClick={handleOpenAddFeature}
                        >
                            Thêm tính năng
                        </CustomButton>
                    )}
                </div>

                {/* Feature Card Grid */}
                <ProviderFeatureCardGrid
                    features={features}
                    onSwitchStatus={handleSwitchStatus}
                    onOpenModal={openFeatureModal}
                    onAddFeature={handleOpenAddFeature}
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

                {/* Create Feature Modal */}
                {createModalState.open && (
                    <CreateFeatureModal
                        open={createModalState.open}
                        dataProviderId={dataProviderId}
                        availableTypes={createModalState.availableTypes}
                        onClose={() => setCreateModalState({ open: false, availableTypes: [] })}
                        onSuccess={refetchAll}
                    />
                )}
            </div>
        </ListWrapper>
    );
};

export default DataProviderFeaturesPage;
