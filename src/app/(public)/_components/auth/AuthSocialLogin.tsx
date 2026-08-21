'use client';

import { CustomButton, CustomDivider, CustomFlex } from '@/components/custom-antd';
import { Icon } from '@iconify/react';

type AuthSocialLoginProps = {
    googleLabel: string;
};

export const AuthSocialLogin = ({ googleLabel }: AuthSocialLoginProps) => {
    const socialLoginContent = (
        <div className="mt-6 space-y-4">
            <CustomDivider label="Hoặc tiếp tục với" />
            <CustomButton
                block
                size="large"
                className="flex items-center justify-center border border-hub-border bg-hub-surface font-medium text-hub-text transition-all duration-200 hover:border-hub-primary/40 hover:bg-hub-section"
            >
                <CustomFlex align="center" justify="center" gap={8}>
                    <Icon icon="logos:google-icon" className="text-lg" />
                    <span>{googleLabel}</span>
                </CustomFlex>
            </CustomButton>
        </div>
    );

    return socialLoginContent;
};
