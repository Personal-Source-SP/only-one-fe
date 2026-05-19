'use client';

import { CustomButton, CustomDivider } from '@/components/custom';
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
                className="cursor-pointer border border-slate-200 transition-colors duration-200 hover:bg-slate-50"
            >
                <Icon icon="logos:google-icon" className="mr-2 text-lg" />
                {googleLabel}
            </CustomButton>
        </div>
    );
};
