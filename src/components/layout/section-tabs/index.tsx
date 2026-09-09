'use client';

import { BreadcrumbNav } from '@/components/common';
import {
    CustomButton,
    CustomDivider,
    CustomFlex,
    CustomSpace,
    CustomTabs,
    CustomTag,
    CustomTypography,
} from '@/components/custom-antd';
import { getSectionBreadcrumbs, getSectionTabs } from '@/libs';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';
import { PropsWithChildren, useCallback, useEffect, useMemo, useRef } from 'react';

export const SectionTabLayout = ({ children }: PropsWithChildren) => {
    const router = useRouter();
    const pathname = usePathname();
    const navRef = useRef<HTMLDivElement>(null);

    const tabs = useMemo(() => getSectionTabs(pathname), [pathname]);
    const breadcrumbs = useMemo(() => getSectionBreadcrumbs(pathname), [pathname]);

    const isSubRoute = useMemo(() => {
        if (!tabs?.length) return false;
        return !tabs.some((tab) => tab.href === pathname);
    }, [pathname, tabs]);

    const activeKey = useMemo(() => {
        if (!tabs?.length) {
            return undefined;
        }

        const matched = tabs.find(
            (tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`),
        );

        return matched?.href ?? tabs[0].href;
    }, [pathname, tabs]);

    const parentHref = useMemo(() => {
        if (!tabs?.length) return undefined;
        const matched = tabs.find(
            (tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`),
        );
        return matched?.href;
    }, [pathname, tabs]);

    const currentTitle = useMemo(() => {
        if (!breadcrumbs?.length) return '';
        const lastItem = breadcrumbs[breadcrumbs.length - 1];
        return typeof lastItem.label === 'string' ? lastItem.label : '';
    }, [breadcrumbs]);

    const handleBack = useCallback(() => {
        if (parentHref) {
            router.push(parentHref);
        } else {
            router.back();
        }
    }, [parentHref, router]);

    const handleTabChange = useCallback(
        (key: string) => {
            router.push(key);
        },
        [router],
    );

    useEffect(() => {
        if (!navRef.current || !activeKey || isSubRoute) return;

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
    }, [activeKey, isSubRoute]);

    if (!tabs?.length) {
        return <>{children}</>;
    }

    return (
        <CustomSpace direction="vertical" size={0} className="w-full">
            {isSubRoute && breadcrumbs && breadcrumbs.length > 0 ? (
                /* Option 4: Enterprise PageHeader Card với các đường phân cách tinh tế */
                <CustomFlex
                    vertical
                    gap={10}
                    className="hub-section-panel mb-3 w-full rounded-hub-card p-3 md:p-3.5 bg-hub-card border border-hub-border shadow-sm"
                >
                    {/* Dòng 1: Breadcrumbs điều hướng */}
                    <CustomFlex align="center" className="px-0.5">
                        <BreadcrumbNav
                            items={breadcrumbs}
                            className="text-xs md:text-sm font-medium"
                        />
                    </CustomFlex>

                    {/* Đường phân cách ngang giữa Breadcrumbs và Title Header */}
                    <CustomDivider className="!my-0.5 border-hub-border/60" />

                    {/* Dòng 2: Nút Quay lại + Phân cách dọc + Tiêu đề trang + Tag */}
                    <CustomFlex align="center" gap={12} className="px-0.5 pt-0.5">
                        <CustomButton
                            type="text"
                            icon={<ArrowLeftOutlined className="text-base" />}
                            onClick={handleBack}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-hub-section hover:bg-hub-primary/10 hover:text-hub-primary text-hub-title transition-all duration-150 shrink-0"
                        />
                        <CustomDivider type="vertical" className="h-5 !my-0 border-hub-border/60" />
                        <CustomFlex align="center" gap={10} className="flex-1 min-w-0">
                            <CustomTypography.Title
                                level={4}
                                className="!mb-0 font-bold tracking-tight text-hub-title truncate"
                            >
                                {currentTitle}
                            </CustomTypography.Title>
                            <CustomTag
                                color="blue"
                                className="rounded-md font-mono text-xs font-semibold shrink-0"
                            >
                                CHI TIẾT
                            </CustomTag>
                        </CustomFlex>
                    </CustomFlex>
                </CustomFlex>
            ) : (
                /* Trang danh sách chính: Section Tabs bình thường */
                <CustomFlex
                    ref={navRef}
                    component="nav"
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
                </CustomFlex>
            )}
            {children}
        </CustomSpace>
    );
};
