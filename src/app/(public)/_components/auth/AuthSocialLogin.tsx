'use client';

import { CustomButton, CustomDivider } from '@/components/custom-antd';
import { Icon } from '@iconify/react';

type AuthSocialLoginProps = {
    googleLabel: string;
};

export const AuthSocialLogin = ({ googleLabel }: AuthSocialLoginProps) => {
    return (
        <div className="mt-6 space-y-4 sm:mt-8">
            <CustomDivider label="Hoặc" />
            <CustomButton
                block
                size="large"
                className="cursor-pointer border border-hub-border bg-hub-surface text-hub-text transition-colors duration-200 hover:border-hub-border-card hover:bg-hub-bg"
            >
                <Icon icon="logos:google-icon" className="mr-2 text-lg" />
                {googleLabel}
            </CustomButton>
        </div>
    );
};
