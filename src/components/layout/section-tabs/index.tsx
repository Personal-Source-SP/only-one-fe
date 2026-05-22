'use client';

import { CustomTabs } from '@/components/custom';
import { getSectionTabs } from '@/libs';
import { usePathname, useRouter } from 'next/navigation';
import { PropsWithChildren, useCallback, useMemo } from 'react';

export const SectionTabLayout = ({ children }: PropsWithChildren) => {
    const router = useRouter();
    const pathname = usePathname();

    const tabs = useMemo(() => getSectionTabs(pathname), [pathname]);

    const activeKey = useMemo(() => {
        if (!tabs?.length) {
            return undefined;
        }

        const matched = tabs.find(
            (tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`),
        );

        return matched?.href ?? tabs[0].href;
    }, [pathname, tabs]);

    const handleTabChange = useCallback(
        (key: string) => {
            router.push(key);
        },
        [router],
    );

    if (!tabs?.length) {
        return <>{children}</>;
    }

    return (
        <>
            <nav
                aria-label="Section navigation"
                className="mb-3 w-full overflow-hidden rounded-hub-card border border-hub-border-card bg-hub-section p-1.5 shadow-sm md:p-2"
            >
                <CustomTabs
                    activeKey={activeKey}
                    className="hub-section-tabs w-full"
                    items={tabs.map((tab) => ({
                        key: tab.href,
                        label: tab.label,
                    }))}
                    onChange={handleTabChange}
                />
            </nav>
            {children}
        </>
    );
};
