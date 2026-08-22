'use client';

import { ListWrapper, type BreadcrumbItem, type CardAction } from '@/components/common';
import {
    CustomButton,
    CustomDropdown,
    CustomFlex,
    CustomSpace,
    CustomTypography,
} from '@/components/custom-antd';
import { DataProviderFeatureType } from '@/enums';
import { Icon } from '@iconify/react';
import { useMemo } from 'react';
import { DataProviderFeatureSettingModal, ProviderFeatureCardGrid } from './components';
import { useDataProviderFeaturesPage } from './hooks';
import type { FeatureModalTab } from './types';

const DataProviderFeaturesPage = () => {
    const {
        router,
        provider,
        features,
        isLoading,
        modalState,
        refetchAll,
        setModalState,
        openFeatureModal,
        openConfigByType,
        closeFeatureModal,
        handleSwitchStatus,
    } = useDataProviderFeaturesPage();

    const isSearchConfigured = features.some((f) => f.type === DataProviderFeatureType.SEARCH);
    const isScrapingConfigured = features.some((f) => f.type === DataProviderFeatureType.SCRAPING);

    const settingMenuItems = useMemo(
        () => [
            {
                key: DataProviderFeatureType.SCRAPING,
                label: (
                    <CustomFlex align="center" gap="middle" className="py-1 px-1">
                        <CustomFlex
                            align="center"
                            justify="center"
                            className="p-1.5 rounded-lg bg-hub-primary/10 text-hub-primary shrink-0"
                        >
                            <Icon icon="lucide:file-code" className="text-base" />
                        </CustomFlex>
                        <CustomFlex vertical gap={2}>
                            <CustomTypography.Text strong className="text-hub-title text-sm">
                                Cào dữ liệu (Scraping)
                            </CustomTypography.Text>
                            <CustomTypography.Text
                                type="secondary"
                                className="text-xs text-hub-subtitle"
                            >
                                {isScrapingConfigured
                                    ? 'Đã khởi tạo • Bấm để chỉnh sửa cấu hình'
                                    : 'Chưa khởi tạo • Bấm để thiết lập cấu hình'}
                            </CustomTypography.Text>
                        </CustomFlex>
                    </CustomFlex>
                ),
                onClick: () => openConfigByType(DataProviderFeatureType.SCRAPING),
            },
            {
                key: DataProviderFeatureType.SEARCH,
                label: (
                    <CustomFlex align="center" gap="middle" className="py-1 px-1">
                        <CustomFlex
                            align="center"
                            justify="center"
                            className="p-1.5 rounded-lg bg-hub-primary/10 text-hub-primary shrink-0"
                        >
                            <Icon icon="lucide:search" className="text-base" />
                        </CustomFlex>
                        <CustomFlex vertical gap={2}>
                            <CustomTypography.Text strong className="text-hub-title text-sm">
                                Tìm kiếm (Search)
                            </CustomTypography.Text>
                            <CustomTypography.Text
                                type="secondary"
                                className="text-xs text-hub-subtitle"
                            >
                                {isSearchConfigured
                                    ? 'Đã khởi tạo • Bấm để chỉnh sửa cấu hình'
                                    : 'Chưa khởi tạo • Bấm để thiết lập cấu hình'}
                            </CustomTypography.Text>
                        </CustomFlex>
                    </CustomFlex>
                ),
                onClick: () => openConfigByType(DataProviderFeatureType.SEARCH),
            },
        ],
        [isScrapingConfigured, isSearchConfigured, openConfigByType],
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
                <ProviderFeatureCardGrid
                    features={features}
                    onOpenModal={openFeatureModal}
                    onSwitchStatus={handleSwitchStatus}
                />

                {modalState.open && modalState.feature && (
                    <DataProviderFeatureSettingModal
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
            </CustomSpace>
        </ListWrapper>
    );
};

export default DataProviderFeaturesPage;
