'use client';

import {
    DataNotFound,
    ListWrapper,
    type BreadcrumbItem,
    type CardAction,
} from '@/components/common';
import {
    CustomButton,
    CustomCol,
    CustomDropdown,
    CustomFlex,
    CustomRow,
    CustomSpace,
    CustomTypography,
} from '@/components/custom-antd';
import { DataProviderFeatureType } from '@/enums';
import { Icon } from '@iconify/react';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FEATURE_TYPE_METADATA } from './constants';
import { FeatureCard, FeatureHistoryModal, FeatureSettingModal } from './components';
import { useDataProviderFeatureActions, useDataProviderFeaturesView } from './hooks';
import type { FeatureModalTab } from './types';

const DataProviderFeaturesPage = () => {
    const router = useRouter();

    const {
        dataProviderId,
        provider,
        features,
        isLoading,
        historyModalState,
        openHistoryModal,
        closeHistoryModal,
        refetchAll,
    } = useDataProviderFeaturesView();

    const {
        modalState,
        setModalState,
        openFeatureModal,
        openConfigByType,
        closeFeatureModal,
        handleSwitchStatus,
    } = useDataProviderFeatureActions({
        dataProviderId,
        features,
        provider,
        refetchAll,
    });

    const settingMenuItems = useMemo(
        () =>
            Object.values(DataProviderFeatureType).map((type) => {
                const meta = FEATURE_TYPE_METADATA[type];
                const isConfigured = features.some((f) => f.type === type);

                return {
                    key: type,
                    label: (
                        <CustomFlex align="center" gap="middle" className="py-1 px-1">
                            <CustomFlex
                                align="center"
                                justify="center"
                                className="p-1.5 rounded-lg bg-hub-primary/10 text-hub-primary shrink-0"
                            >
                                <Icon
                                    icon={meta?.icon || 'lucide:file-code'}
                                    className="text-base"
                                />
                            </CustomFlex>
                            <CustomFlex vertical gap={2}>
                                <CustomTypography.Text strong className="text-hub-title text-sm">
                                    {meta?.label || type}
                                </CustomTypography.Text>
                                <CustomTypography.Text
                                    type="secondary"
                                    className="text-xs text-hub-subtitle"
                                >
                                    {isConfigured
                                        ? 'Đã khởi tạo • Bấm để chỉnh sửa cấu hình'
                                        : 'Chưa khởi tạo • Bấm để thiết lập cấu hình'}
                                </CustomTypography.Text>
                            </CustomFlex>
                        </CustomFlex>
                    ),
                    onClick: () => openConfigByType(type),
                };
            }),
        [features, openConfigByType],
    );

    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            {
                label: 'Danh sách nhà cung cấp',
                icon: <Icon icon="lucide:arrow-left" className="w-5 h-5" />,
                onClick: () => router.push('/scraping/data-providers'),
            },
            {
                label: provider?.name || 'Chi tiết tính năng',
            },
        ],
        [provider?.name, router],
    );

    const actions: CardAction[] = useMemo(
        () => [
            {
                component: (
                    <CustomDropdown
                        trigger={['click']}
                        placement="bottomRight"
                        menu={{ items: settingMenuItems }}
                    >
                        <CustomButton
                            type="primary"
                            icon={<Icon icon="lucide:settings-2" className="text-base" />}
                        >
                            <span>Thêm cài đặt</span>
                            <Icon icon="lucide:chevron-down" className="ml-1 text-xs" />
                        </CustomButton>
                    </CustomDropdown>
                ),
            },
        ],
        [settingMenuItems],
    );

    const sectionTitle = useMemo(
        () => (
            <CustomFlex vertical gap={2}>
                <CustomTypography.Title
                    level={5}
                    className="!mb-0 text-hub-title flex items-center gap-2 !font-bold text-lg"
                >
                    <Icon icon="lucide:layers" className="text-hub-primary" />
                    <span>Các tính năng hoạt động</span>
                </CustomTypography.Title>
                <CustomTypography.Paragraph
                    type="secondary"
                    className="!mb-0 text-xs text-hub-subtitle mt-0.5"
                >
                    Quản lý trạng thái, cấu hình và lịch sử thực thi của các tính năng trực thuộc
                    nhà cung cấp này
                </CustomTypography.Paragraph>
            </CustomFlex>
        ),
        [],
    );

    return (
        <ListWrapper
            withCard={false}
            actions={actions}
            isLoading={isLoading}
            filters={sectionTitle}
            breadcrumb={breadcrumbs}
        >
            <CustomSpace direction="vertical" size="large" className="w-full">
                {!features?.length ? (
                    <DataNotFound
                        fullWidth
                        icon="lucide:layers"
                        title="Chưa có tính năng nào"
                        message="Nhà cung cấp này chưa được thiết lập tính năng thu thập dữ liệu nào. Vui lòng sử dụng nút 'Thêm cài đặt' phía trên để bắt đầu cấu hình."
                    />
                ) : (
                    <CustomRow gutter={[24, 24]} className="w-full">
                        {features.map((feature) => (
                            <CustomCol key={feature.id} xs={24} lg={12} className="flex">
                                <FeatureCard
                                    feature={feature}
                                    onOpenModal={openFeatureModal}
                                    onOpenHistoryModal={openHistoryModal}
                                    onSwitchStatus={handleSwitchStatus}
                                />
                            </CustomCol>
                        ))}
                    </CustomRow>
                )}

                {modalState.open && modalState.feature && (
                    <FeatureSettingModal
                        open={modalState.open}
                        onSuccess={refetchAll}
                        onClose={closeFeatureModal}
                        feature={modalState.feature}
                        activeTab={modalState.activeTab}
                        onTabChange={(tab: FeatureModalTab) =>
                            setModalState((prev) => ({ ...prev, activeTab: tab }))
                        }
                    />
                )}

                {historyModalState.open && historyModalState.feature && (
                    <FeatureHistoryModal
                        open={historyModalState.open}
                        feature={historyModalState.feature}
                        onSuccess={refetchAll}
                        onClose={closeHistoryModal}
                    />
                )}
            </CustomSpace>
        </ListWrapper>
    );
};

export default DataProviderFeaturesPage;
