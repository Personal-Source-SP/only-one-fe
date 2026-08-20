'use client';

import type { FC, JSX } from 'react';
import { CustomButton } from '@/components/custom-antd';
import type { NDataProvider } from '@/interfaces';
import { formatDate } from '@/libs';
import { Icon } from '@iconify/react';

interface ProviderFeaturesHeaderProps {
    provider?: NDataProvider.IDataProvider;
    onBack: () => void;
}

export const ProviderFeaturesHeader: FC<ProviderFeaturesHeaderProps> = ({
    provider,
    onBack,
}): JSX.Element => {
    return (
        <div className="space-y-4">
            {/* Breadcrumb & Navigation */}
            <div className="flex items-center gap-3">
                <CustomButton
                    type="text"
                    icon={<Icon icon="lucide:arrow-left" className="w-5 h-5" />}
                    onClick={onBack}
                    className="hover:bg-hub-section"
                >
                    Danh sách nhà cung cấp
                </CustomButton>
                <span className="text-hub-subtitle">/</span>
                <span className="text-sm font-medium text-hub-title truncate">
                    {provider?.name || 'Chi tiết tính năng'}
                </span>
            </div>

            {/* Provider Info Banner Card */}
            <div className="bg-hub-section/40 border border-hub-border/60 rounded-2xl p-5 sm:p-6 backdrop-blur-sm shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 rounded-xl bg-hub-primary/10 border border-hub-primary/20 text-hub-primary">
                            <Icon icon="lucide:database" className="w-7 h-7" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h1 className="text-xl font-bold text-hub-title">
                                    {provider?.name || 'Đang tải...'}
                                </h1>
                                {provider?.identifier && (
                                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-hub-section border border-hub-border text-hub-subtitle">
                                        {provider.identifier}
                                    </span>
                                )}
                            </div>
                            {provider?.baseUrl && (
                                <a
                                    href={provider.baseUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-hub-primary hover:underline flex items-center gap-1 mt-1 inline-flex"
                                >
                                    <span>{provider.baseUrl}</span>
                                    <Icon icon="lucide:external-link" className="w-3.5 h-3.5" />
                                </a>
                            )}
                        </div>
                    </div>

                    {provider?.createdAt && (
                        <div className="text-xs text-hub-subtitle sm:text-right">
                            <span>Ngày tạo: </span>
                            <span className="font-medium text-hub-title">
                                {formatDate(provider.createdAt)}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
