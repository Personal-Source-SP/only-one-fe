'use client';

import { Logo } from '@/components/common';
import { CustomCard } from '@/components/custom';
import { ReactNode } from 'react';

type AuthCardProps = {
    children: ReactNode;
    subtitle: string;
    footer?: ReactNode;
};

const AuthCard = ({ children, footer, subtitle }: AuthCardProps) => {
    return (
        <CustomCard
            footer={footer}
            paddingSize="responsive"
            header={
                <header className="flex flex-col items-center gap-2 text-center">
                    <Logo iconSize="3xl" textSize="2xl" />
                    <p className="text-sm text-slate-600 sm:text-base">{subtitle}</p>
                </header>
            }
        >
            {children}
        </CustomCard>
    );
};

export default AuthCard;
