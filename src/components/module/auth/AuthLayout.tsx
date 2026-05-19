import { ReactNode } from 'react';

type AuthLayoutProps = {
    children: ReactNode;
};

const AuthLayout = ({ children }: AuthLayoutProps) => {
    return (
        <main className="relative min-h-screen w-full overflow-x-hidden bg-[#F8FAFC]">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(#1840DC_0.5px,transparent_0.5px)] [background-size:24px_24px] opacity-[0.03]"
            />
            <div className="relative flex min-h-screen w-full flex-col items-center justify-center px-4 py-8 sm:px-6 md:py-12 lg:py-16">
                <div className="w-full max-w-[420px] lg:max-w-[440px]">{children}</div>
            </div>
        </main>
    );
};

export default AuthLayout;
