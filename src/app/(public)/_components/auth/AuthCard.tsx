'use client';

import { Logo } from '@/components/common';
import { CustomTypography } from '@/components/custom-antd';
import { ReactNode } from 'react';

type AuthCardProps = {
    children: ReactNode;
    subtitle: string;
    footer?: ReactNode;
};

export const AuthCard = ({ children, footer, subtitle }: AuthCardProps) => {
    const cardContent = (
        <div className="flex w-full flex-col justify-center p-6 sm:p-8 lg:p-10 xl:p-12">
            {/* Header */}
            <div className="mb-6 text-center lg:text-left">
                <div className="mb-3 flex justify-center text-hub-title lg:hidden">
                    <Logo iconSize="2xl" textSize="xl" />
                </div>
                <CustomTypography.Title
                    level={2}
                    className="!m-0 !text-2xl !font-bold tracking-tight !text-hub-title sm:!text-3xl"
                >
                    Only One Hub
                </CustomTypography.Title>
                <CustomTypography.Paragraph className="!mb-0 !mt-1 text-xs text-hub-muted sm:text-sm">
                    {subtitle}
                </CustomTypography.Paragraph>
            </div>

            {/* Form Content */}
            <div className="w-full">{children}</div>

            {/* Footer */}
            {footer && <div className="mt-6 text-center">{footer}</div>}
        </div>
    );

    return cardContent;
};
