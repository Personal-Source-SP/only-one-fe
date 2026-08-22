'use client';

import type { FC, JSX } from 'react';
import type { IDataProvider } from '@/app/(root)/scraping/data-providers/types';
import {
    CustomCard,
    CustomFlex,
    CustomSkeleton,
    CustomTag,
    CustomTypography,
} from '@/components/custom-antd';
import { formatDate } from '@/libs';
import { Icon } from '@iconify/react';

interface ProviderFeaturesHeaderProps {
    isLoading?: boolean;
    provider?: IDataProvider;
}

export const ProviderFeaturesHeader: FC<ProviderFeaturesHeaderProps> = ({
    isLoading = false,
    provider,
}): JSX.Element => {
    if (isLoading) {
        return (
            <CustomCard
                className="bg-hub-section/40 border-hub-border/60 backdrop-blur-sm shadow-sm rounded-2xl p-5 sm:p-6"
                styles={{ body: { padding: 0 } }}
            >
                <CustomSkeleton
                    active
                    avatar={{ size: 56, shape: 'square' }}
                    paragraph={{ rows: 2 }}
                />
            </CustomCard>
        );
    }

    return (
        <CustomCard
            className="bg-hub-section/40 border-hub-border/60 backdrop-blur-sm shadow-sm rounded-2xl"
            styles={{ body: { padding: '20px 24px' } }}
        >
            <CustomFlex
                justify="space-between"
                align="center"
                gap="middle"
                className="flex-col sm:flex-row"
            >
                {/* Left Side: Avatar/Icon + Title + Badges + Link */}
                <CustomFlex align="center" gap="middle" className="w-full sm:w-auto min-w-0">
                    <div className="p-3.5 rounded-xl bg-hub-primary/10 border border-hub-primary/20 text-hub-primary shrink-0 flex items-center justify-center">
                        <Icon icon="lucide:database" className="w-7 h-7" />
                    </div>
                    <CustomFlex vertical gap={4} className="min-w-0 flex-1">
                        <CustomFlex align="center" gap="small" wrap>
                            <CustomTypography.Title
                                level={4}
                                className="!mb-0 text-hub-title truncate !font-bold text-xl"
                            >
                                {provider?.name || 'Chi tiết nhà cung cấp'}
                            </CustomTypography.Title>
                            {provider?.identifier && (
                                <CustomTag className="font-mono bg-hub-section border-hub-border text-hub-subtitle text-xs rounded-full px-2.5 py-0.5 m-0">
                                    {provider.identifier}
                                </CustomTag>
                            )}
                        </CustomFlex>

                        {provider?.baseUrl && (
                            <CustomTypography.Link
                                href={provider.baseUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-hub-primary hover:underline flex items-center gap-1 inline-flex max-w-full truncate"
                            >
                                <span className="truncate">{provider.baseUrl}</span>
                                <Icon
                                    icon="lucide:external-link"
                                    className="w-3.5 h-3.5 shrink-0"
                                />
                            </CustomTypography.Link>
                        )}
                    </CustomFlex>
                </CustomFlex>

                {/* Right Side: Meta Items */}
                {provider?.createdAt && (
                    <CustomFlex
                        vertical
                        align="flex-start"
                        justify="space-between"
                        gap="small"
                        className="w-full sm:w-auto sm:items-end shrink-0"
                    >
                        <CustomFlex align="center" gap={4} className="text-xs text-hub-subtitle">
                            <span>Ngày tạo:</span>
                            <CustomTypography.Text strong className="text-hub-title font-medium">
                                {formatDate(provider.createdAt)}
                            </CustomTypography.Text>
                        </CustomFlex>
                    </CustomFlex>
                )}
            </CustomFlex>
        </CustomCard>
    );
};
