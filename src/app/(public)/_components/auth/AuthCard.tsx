'use client';

import { Logo } from '@/components/common';
import { CustomCard } from '@/components/custom-antd';
import { ReactNode } from 'react';

type AuthCardProps = {
    children: ReactNode;
    subtitle: string;
    footer?: ReactNode;
};

export const AuthCard = ({ children, footer, subtitle }: AuthCardProps) => {
    return (
        <CustomCard
            footer={footer}
            paddingSize="responsive"
            header={
                <header className="flex flex-col items-center gap-2 text-center">
                    <div className="flex justify-center text-hub-title">
                        <Logo iconSize="3xl" textSize="2xl" />
                    </div>
                    <h1 className="text-base font-semibold leading-snug text-hub-title sm:text-lg">
                        {subtitle}
                    </h1>
                </header>
            }
        >
            {children}
        </CustomCard>
    );
};
