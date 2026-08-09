'use client';

import { CustomTabs } from '@/components/custom-antd';
import { getSectionTabs } from '@/libs';
import { usePathname, useRouter } from 'next/navigation';
import { PropsWithChildren, useCallback, useEffect, useMemo, useRef } from 'react';

export const SectionTabLayout = ({ children }: PropsWithChildren) => {
    const router = useRouter();
    const pathname = usePathname();
    const navRef = useRef<HTMLElement>(null);

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

    useEffect(() => {
        if (!navRef.current || !activeKey) return;

        const navWrap = navRef.current.querySelector<HTMLElement>('.ant-tabs-nav-wrap');
        const activeTabEl = navRef.current.querySelector<HTMLElement>('.ant-tabs-tab-active');

        if (navWrap && activeTabEl) {
            const wrapRect = navWrap.getBoundingClientRect();
            const tabRect = activeTabEl.getBoundingClientRect();
            const scrollLeft =
                navWrap.scrollLeft +
                (tabRect.left - wrapRect.left) -
                wrapRect.width / 2 +
                tabRect.width / 2;
            navWrap.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
    }, [activeKey]);

    if (!tabs?.length) {
        return <>{children}</>;
    }

    return (
        <>
            <nav
                ref={navRef}
                aria-label="Section navigation"
                className="hub-section-panel mb-3 w-full overflow-hidden rounded-hub-card p-1.5 max-md:hidden hidden md:block md:p-2"
            >
                <CustomTabs
                    activeKey={activeKey}
                    onChange={handleTabChange}
                    className={`hub-section-tabs w-full ${tabs.length <= 3 ? 'hub-section-tabs-fill' : ''}`}
                    items={tabs.map((tab) => ({
                        key: tab.href,
                        label: tab.label,
                    }))}
                />
            </nav>
            {children}
        </>
    );
};
