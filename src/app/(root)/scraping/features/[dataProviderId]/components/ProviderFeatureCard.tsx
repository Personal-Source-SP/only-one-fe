'use client';

import type { FC, JSX } from 'react';
import type { FeatureModalTab } from '@/app/(root)/scraping/features/[dataProviderId]/types';
import { CustomButton, CustomSwitch } from '@/components/custom-antd';
import { DataProviderFeatureStatus, DataProviderFeatureType } from '@/enums';
import type { NDataProvider } from '@/interfaces';
import { formatDate } from '@/libs';
import { Icon } from '@iconify/react';

interface ProviderFeatureCardProps {
    feature: NDataProvider.IDataProviderFeature;
    onSwitchStatus: (featureId: string, currentStatus: DataProviderFeatureStatus) => void;
    onOpenModal: (feature: NDataProvider.IDataProviderFeature, tab: FeatureModalTab) => void;
}

export const ProviderFeatureCard: FC<ProviderFeatureCardProps> = ({
    feature,
    onSwitchStatus,
    onOpenModal,
}): JSX.Element => {
    const isScraping = feature.type === DataProviderFeatureType.SCRAPING;
    const isReady = feature.status === DataProviderFeatureStatus.READY;
    const isError =
        feature.status === DataProviderFeatureStatus.ERROR || feature.consecutiveFailures > 0;

    const accentColor = isScraping
        ? 'text-emerald-500 bg-emerald-500/10'
        : 'text-indigo-500 bg-indigo-500/10';
    const iconName = isScraping ? 'lucide:bot' : 'lucide:search';

    return (
        <div className="bg-hub-section/40 border border-hub-border/60 hover:border-hub-primary/60 transition-all duration-200 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-sm hover:shadow-md">
            <div>
                {/* Card Header: Icon, Title, Service, Switch */}
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${accentColor}`}>
                            <Icon icon={iconName} className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-base font-bold text-hub-title">
                                    {isScraping ? 'Cào dữ liệu (Scraping)' : 'Tìm kiếm (Search)'}
                                </h3>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-hub-section border border-hub-border text-hub-subtitle font-mono">
                                    {feature.service || 'generic'}
                                </span>
                            </div>
                            <p className="text-xs text-hub-subtitle mt-0.5">
                                {isScraping
                                    ? 'Thu thập dữ liệu chi tiết sản phẩm'
                                    : 'Tìm kiếm sản phẩm theo từ khóa'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <CustomSwitch
                            checked={isReady}
                            disabled={feature.status === DataProviderFeatureStatus.UNCONFIGURED}
                            onChange={() => onSwitchStatus(feature.id, feature.status)}
                            checkedChildren="Bật"
                            unCheckedChildren="Tắt"
                        />
                    </div>
                </div>

                {/* Health Metrics 2x2 Grid */}
                <div className="grid grid-cols-2 gap-3 bg-hub-section/30 border border-hub-border/40 rounded-xl p-3.5 my-4">
                    <div>
                        <span className="text-xs text-hub-subtitle block">Trạng thái</span>
                        <div className="flex items-center gap-1.5 mt-1">
                            <span
                                className={`w-2 h-2 rounded-full ${
                                    isReady
                                        ? 'bg-emerald-500 animate-pulse'
                                        : isError
                                          ? 'bg-rose-500'
                                          : 'bg-slate-400'
                                }`}
                            />
                            <span className="text-xs font-semibold text-hub-title">
                                {feature.status}
                            </span>
                        </div>
                    </div>

                    <div>
                        <span className="text-xs text-hub-subtitle block">Số lỗi liên tiếp</span>
                        <span
                            className={`text-xs font-semibold mt-1 block ${
                                isError ? 'text-rose-500' : 'text-emerald-500'
                            }`}
                        >
                            {feature.consecutiveFailures > 0
                                ? `${feature.consecutiveFailures} lỗi`
                                : '0 (Ổn định)'}
                        </span>
                    </div>

                    <div>
                        <span className="text-xs text-hub-subtitle block">Chạy OK cuối</span>
                        <span className="text-xs font-medium text-hub-title mt-1 block truncate">
                            {feature.lastSuccessfulRunAt
                                ? formatDate(feature.lastSuccessfulRunAt)
                                : 'Chưa chạy'}
                        </span>
                    </div>

                    <div>
                        <span className="text-xs text-hub-subtitle block">Chạy lỗi cuối</span>
                        <span className="text-xs font-medium text-hub-title mt-1 block truncate">
                            {feature.lastFailedRunAt
                                ? formatDate(feature.lastFailedRunAt)
                                : 'Chưa có lỗi'}
                        </span>
                    </div>
                </div>

                {feature.lastErrorMessage && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs rounded-lg p-2.5 mb-4 flex items-start gap-2">
                        <Icon icon="lucide:alert-circle" className="w-4 h-4 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{feature.lastErrorMessage}</span>
                    </div>
                )}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-hub-border/40">
                <div className="flex items-center gap-2">
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
                </div>

                <CustomButton
                    type="text"
                    icon={<Icon icon="lucide:history" />}
                    onClick={() => onOpenModal(feature, 'versions')}
                >
                    Lịch sử
                </CustomButton>
            </div>
        </div>
    );
};
