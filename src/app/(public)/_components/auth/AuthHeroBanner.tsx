'use client';

import React from 'react';
import Image from 'next/image';
import { Logo } from '@/components/common';
import { CustomFlex, CustomSpace, CustomTag, CustomTypography } from '@/components/custom-antd';
import { Icon } from '@iconify/react';

export const AuthHeroBanner = () => {
    const bannerContent = (
        <div className="relative h-full min-h-[580px] w-full overflow-hidden bg-hub-section">
            {/* Visual Banner Image filling entire left column */}
            <Image
                src="/images/auth-infinity-banner.jpg"
                alt="Only One Hub - Infinity Portal"
                fill
                priority
                sizes="(max-width: 1024px) 0vw, 50vw"
                className="object-cover object-center transition-transform duration-700 hover:scale-105"
            />

            {/* Subtle Gradient Ambient Overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

            {/* Floating Top Badge */}
            <div className="absolute left-6 top-6 z-10">
                <CustomFlex
                    align="center"
                    gap={10}
                    className="rounded-full border border-white/20 bg-black/40 px-4 py-1.5 backdrop-blur-md"
                >
                    <div className="text-white">
                        <Logo iconSize="lg" textSize="lg" />
                    </div>
                    <CustomTag color="orange" className="m-0 border-none font-semibold">
                        Enterprise Portal
                    </CustomTag>
                </CustomFlex>
            </div>

            {/* Bottom Value Prop Overlay */}
            <div className="absolute bottom-6 left-6 right-6 z-10">
                <CustomSpace size="small" direction="vertical" className="w-full">
                    <CustomFlex align="center" gap={6}>
                        <Icon icon="lucide:sparkles" className="text-sm text-amber-300" />
                        <CustomTypography.Text className="text-xs font-semibold uppercase tracking-wider text-amber-200">
                            Infinite Integration & Automation
                        </CustomTypography.Text>
                    </CustomFlex>

                    <CustomTypography.Paragraph className="!m-0 max-w-md text-xs !text-gray-200 sm:text-sm">
                        Hệ sinh thái điều hành tập trung — Kết nối dữ liệu không giới hạn, tự động
                        hoá quy trình và tối ưu hiệu suất vận hành.
                    </CustomTypography.Paragraph>
                </CustomSpace>
            </div>
        </div>
    );

    return bannerContent;
};
