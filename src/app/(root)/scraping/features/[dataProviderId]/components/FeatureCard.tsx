'use client';

import {
    CustomButton,
    CustomCard,
    CustomCol,
    CustomFlex,
    CustomRow,
    CustomSwitch,
    CustomTag,
    CustomTypography,
} from '@/components/custom-antd';
import { DataProviderFeatureStatus, DataProviderFeatureType } from '@/enums';
import { formatDate } from '@/libs';
import { Icon } from '@iconify/react';
import { FEATURE_TYPE_METADATA } from '../constants';
import type { FeatureModalTab, IDataProviderFeature } from '../types';

type FeatureCardProps = {
    feature: IDataProviderFeature;
    onOpenModal: (feature: IDataProviderFeature, tab: FeatureModalTab) => void;
    onSwitchStatus: (featureId: string, currentStatus: DataProviderFeatureStatus) => void;
};

export const FeatureCard = ({ feature, onOpenModal, onSwitchStatus }: FeatureCardProps) => {
    const meta = FEATURE_TYPE_METADATA[feature.type];

    const isReady = feature.status === DataProviderFeatureStatus.READY;
    const isError =
        feature.status === DataProviderFeatureStatus.ERROR || feature.consecutiveFailures > 0;

    const iconName = meta?.icon || 'lucide:cpu';
    const featureTitle = meta?.label || feature.type;
    const featureDescription = meta?.description || '';
    const accentColor = meta?.accentClass || 'text-hub-primary bg-hub-primary/10';

    return (
        <CustomCard
            className="hover:border-hub-primary/60 transition-all duration-200 shadow-sm hover:shadow-md h-full rounded-2xl"
            styles={{
                body: {
                    padding: '20px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                },
            }}
        >
            <CustomFlex vertical className="w-full">
                {/* Card Header: Icon, Title, Service, Switch */}
                <CustomFlex
                    align="flex-start"
                    justify="space-between"
                    gap="middle"
                    className="mb-4"
                >
                    <CustomFlex align="center" gap="middle">
                        <CustomFlex
                            align="center"
                            justify="center"
                            className={`p-3 rounded-xl shrink-0 ${accentColor}`}
                        >
                            <Icon icon={iconName} className="w-6 h-6" />
                        </CustomFlex>
                        <CustomFlex vertical gap={2}>
                            <CustomFlex align="center" gap="small" wrap>
                                <CustomTypography.Title
                                    level={5}
                                    className="!mb-0 text-base !font-bold text-hub-title"
                                >
                                    {featureTitle}
                                </CustomTypography.Title>
                                <CustomTag className="font-mono text-xs m-0">
                                    {feature.service || 'generic'}
                                </CustomTag>
                            </CustomFlex>
                            <CustomTypography.Paragraph
                                type="secondary"
                                className="!mb-0 text-xs text-hub-subtitle mt-0.5"
                            >
                                {featureDescription}
                            </CustomTypography.Paragraph>
                        </CustomFlex>
                    </CustomFlex>

                    <CustomFlex align="center" gap="small" className="shrink-0">
                        <CustomSwitch
                            checked={isReady}
                            disabled={feature.status === DataProviderFeatureStatus.UNCONFIGURED}
                            onChange={() => onSwitchStatus(feature.id, feature.status)}
                            checkedChildren="Bật"
                            unCheckedChildren="Tắt"
                        />
                    </CustomFlex>
                </CustomFlex>

                {/* Health Metrics 2x2 Grid */}
                <CustomRow
                    gutter={[12, 12]}
                    className="bg-hub-section/30 border border-hub-border/40 rounded-xl p-3.5 my-4 w-full"
                >
                    <CustomCol span={12}>
                        <CustomTypography.Text
                            type="secondary"
                            className="text-xs text-hub-subtitle block"
                        >
                            Trạng thái
                        </CustomTypography.Text>
                        <CustomFlex align="center" gap={6} className="mt-1">
                            <span
                                className={`w-2 h-2 rounded-full ${
                                    isReady
                                        ? 'bg-emerald-500 animate-pulse'
                                        : isError
                                          ? 'bg-rose-500'
                                          : 'bg-slate-400'
                                }`}
                            />
                            <CustomTypography.Text strong className="text-xs text-hub-title">
                                {feature.status}
                            </CustomTypography.Text>
                        </CustomFlex>
                    </CustomCol>

                    <CustomCol span={12}>
                        <CustomTypography.Text
                            type="secondary"
                            className="text-xs text-hub-subtitle block"
                        >
                            Số lỗi liên tiếp
                        </CustomTypography.Text>
                        <CustomTypography.Text
                            strong
                            className={`text-xs mt-1 block ${
                                isError ? 'text-rose-500' : 'text-emerald-500'
                            }`}
                        >
                            {feature.consecutiveFailures > 0
                                ? `${feature.consecutiveFailures} lỗi`
                                : '0 (Ổn định)'}
                        </CustomTypography.Text>
                    </CustomCol>

                    <CustomCol span={12}>
                        <CustomTypography.Text
                            type="secondary"
                            className="text-xs text-hub-subtitle block"
                        >
                            Chạy OK cuối
                        </CustomTypography.Text>
                        <CustomTypography.Text className="text-xs font-medium text-hub-title mt-1 block truncate">
                            {feature.lastSuccessfulRunAt
                                ? formatDate(feature.lastSuccessfulRunAt)
                                : 'Chưa chạy'}
                        </CustomTypography.Text>
                    </CustomCol>

                    <CustomCol span={12}>
                        <CustomTypography.Text
                            type="secondary"
                            className="text-xs text-hub-subtitle block"
                        >
                            Chạy lỗi cuối
                        </CustomTypography.Text>
                        <CustomTypography.Text className="text-xs font-medium text-hub-title mt-1 block truncate">
                            {feature.lastFailedRunAt
                                ? formatDate(feature.lastFailedRunAt)
                                : 'Chưa có lỗi'}
                        </CustomTypography.Text>
                    </CustomCol>
                </CustomRow>

                {feature.lastErrorMessage && (
                    <CustomFlex
                        align="flex-start"
                        gap="small"
                        className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs rounded-lg p-2.5 mb-4"
                    >
                        <Icon icon="lucide:alert-circle" className="w-4 h-4 shrink-0 mt-0.5" />
                        <CustomTypography.Text type="danger" className="text-xs line-clamp-2">
                            {feature.lastErrorMessage}
                        </CustomTypography.Text>
                    </CustomFlex>
                )}
            </CustomFlex>

            {/* Action Bar */}
            <CustomFlex
                align="center"
                justify="space-between"
                gap="small"
                className="pt-3 border-t border-hub-border/40 mt-auto w-full"
            >
                <CustomFlex align="center" gap="small">
                    <CustomButton
                        type="primary"
                        icon={<Icon icon="lucide:settings" />}
                        onClick={() => onOpenModal(feature, 'config')}
                    >
                        Cấu hình
                    </CustomButton>

                    <CustomButton
                        icon={<Icon icon="lucide:flask-conical" />}
                        onClick={() => onOpenModal(feature, 'test')}
                    >
                        Thử nghiệm
                    </CustomButton>
                </CustomFlex>

                <CustomButton
                    type="text"
                    icon={<Icon icon="lucide:history" />}
                    onClick={() => onOpenModal(feature, 'config')}
                >
                    Lịch sử
                </CustomButton>
            </CustomFlex>
        </CustomCard>
    );
};
