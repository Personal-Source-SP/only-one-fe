import { PropsWithChildren } from 'react';
import { CustomCol, CustomRow } from '@/components/custom-antd';
import { AuthHeroBanner } from './AuthHeroBanner';

export const AuthLayout = ({ children }: PropsWithChildren) => {
    const layoutContent = (
        <main className="relative flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-hub-bg px-4 py-8 sm:px-6 md:py-12 lg:px-8">
            {/* Unified Master Portal Card */}
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-hub-border-card bg-hub-surface shadow-2xl transition-all duration-300 lg:max-w-4xl xl:max-w-5xl">
                <CustomRow className="w-full" gutter={0}>
                    {/* Left Column: Hero Image Banner (Edge-to-Edge on Desktop) */}
                    <CustomCol xs={0} lg={12} className="relative">
                        <AuthHeroBanner />
                    </CustomCol>

                    {/* Right Column: Integrated Form Area */}
                    <CustomCol xs={24} lg={12} className="flex flex-col justify-center">
                        {children}
                    </CustomCol>
                </CustomRow>
            </div>
        </main>
    );

    return layoutContent;
};
