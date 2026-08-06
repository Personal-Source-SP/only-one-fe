import { CustomSpace } from '@/components/custom';
import { PropsWithChildren } from 'react';

export const AuthLayout = ({ children }: PropsWithChildren) => {
    return (
        <main className="relative min-h-screen w-full overflow-x-hidden bg-hub-bg">
            <div className="relative flex min-h-screen w-full flex-col items-center justify-center px-4 py-8 sm:px-6 md:py-12 lg:py-16">
                <CustomSpace
                    size="small"
                    direction="vertical"
                    className="w-full min-w-0 max-w-[420px] lg:max-w-[440px]"
                >
                    {children}
                </CustomSpace>
            </div>
        </main>
    );
};
