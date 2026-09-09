'use client';

import {
    DiscoverySessionStatus,
    type IDiscoverySession,
} from '@/app/(root)/scraping/discovery/types';
import {
    CustomCard,
    CustomCol,
    CustomDivider,
    CustomFlex,
    CustomRow,
    CustomTag,
    CustomTypography,
} from '@/components/custom-antd';
import { formatDate } from '@/libs';
import { Icon } from '@iconify/react';
import { useMemo } from 'react';
import { SessionMetricCard } from './SessionMetricCard';

interface SessionOverviewCardProps {
    session?: IDiscoverySession;
    sessionId: string;
    urlsCount: number;
    queuedCount: number;
}

export const SessionOverviewCard = ({
    session,
    sessionId,
    urlsCount,
    queuedCount,
}: SessionOverviewCardProps) => {
    const statusMeta = useMemo(() => {
        switch (session?.status) {
            case DiscoverySessionStatus.COMPLETED:
                return {
                    icon: 'lucide:check-circle-2',
                    label: 'Hoàn thành',
                    bgClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                };
            case DiscoverySessionStatus.IN_PROGRESS:
                return {
                    icon: 'lucide:loader-2',
                    label: 'Đang khám phá',
                    bgClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                };
            case DiscoverySessionStatus.FAILED:
                return {
                    icon: 'lucide:alert-circle',
                    label: 'Thất bại',
                    bgClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
                };
            default:
                return {
                    icon: 'lucide:clock',
                    label: 'Đang chờ',
                    bgClass: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
                };
        }
    }, [session?.status]);

    return (
        <CustomCard
            className="overflow-hidden rounded-2xl border-hub-border bg-hub-card shadow-sm"
            styles={{ body: { padding: '24px' } }}
        >
            <CustomFlex vertical gap={20}>
                {/* Header: Session Identity & Status */}
                <CustomFlex justify="space-between" align="center" wrap="wrap" gap={12}>
                    <CustomFlex align="center" gap={12}>
                        <CustomFlex
                            align="center"
                            justify="center"
                            className="h-12 w-12 rounded-xl bg-hub-primary/10 text-hub-primary shadow-inner"
                        >
                            <Icon icon="noto:compass" className="text-2xl" />
                        </CustomFlex>
                        <CustomFlex vertical gap={2}>
                            <CustomFlex align="center" gap={8}>
                                <CustomTypography.Title
                                    level={4}
                                    className="!mb-0 font-bold tracking-tight"
                                >
                                    {session?.sessionCode || sessionId}
                                </CustomTypography.Title>
                                <CustomTag
                                    color="blue"
                                    className="rounded-md font-mono text-xs font-semibold"
                                >
                                    SESSION
                                </CustomTag>
                            </CustomFlex>
                            <CustomTypography.Text
                                type="secondary"
                                className="text-xs text-hub-subtitle"
                            >
                                Khởi tạo lúc:{' '}
                                {session?.createdAt ? formatDate(session.createdAt) : '—'}
                            </CustomTypography.Text>
                        </CustomFlex>
                    </CustomFlex>

                    {session && (
                        <CustomFlex
                            align="center"
                            gap={8}
                            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${statusMeta.bgClass}`}
                        >
                            <Icon
                                icon={statusMeta.icon}
                                className={`text-sm ${session.status === DiscoverySessionStatus.IN_PROGRESS ? 'animate-spin' : ''}`}
                            />
                            <CustomTypography.Text className="text-xs font-semibold text-inherit">
                                {statusMeta.label}
                            </CustomTypography.Text>
                        </CustomFlex>
                    )}
                </CustomFlex>

                {/* Metric Cards Grid */}
                <CustomRow gutter={[16, 16]}>
                    {/* 1. Nhà cung cấp */}
                    <CustomCol xs={24} sm={12} lg={6}>
                        <SessionMetricCard
                            title="Nhà cung cấp"
                            icon={
                                <CustomFlex
                                    align="center"
                                    justify="center"
                                    className="h-7 w-7 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400"
                                >
                                    <Icon icon="noto:factory" className="text-sm" />
                                </CustomFlex>
                            }
                        >
                            <CustomFlex vertical gap={2}>
                                <CustomTypography.Text
                                    strong
                                    className="text-sm text-hub-title truncate"
                                >
                                    {session?.dataProvider?.name || '—'}
                                </CustomTypography.Text>
                                <CustomTypography.Text className="font-mono text-xs text-hub-subtitle">
                                    ID: {session?.dataProviderId || '—'}
                                </CustomTypography.Text>
                            </CustomFlex>
                        </SessionMetricCard>
                    </CustomCol>

                    {/* 2. URL Mục tiêu */}
                    <CustomCol xs={24} sm={12} lg={6}>
                        <SessionMetricCard
                            title="URL Khám phá ban đầu"
                            icon={
                                <CustomFlex
                                    align="center"
                                    justify="center"
                                    className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                >
                                    <Icon icon="lucide:globe" className="text-sm" />
                                </CustomFlex>
                            }
                        >
                            <CustomFlex vertical gap={2}>
                                <a
                                    href={session?.targetUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    title={session?.targetUrl}
                                    className="text-xs font-medium text-hub-primary hover:underline truncate inline-flex items-center gap-1"
                                >
                                    <span className="truncate">{session?.targetUrl || '—'}</span>
                                    <Icon
                                        icon="lucide:external-link"
                                        className="w-3 h-3 shrink-0 opacity-70"
                                    />
                                </a>
                                <CustomTypography.Text className="text-[11px] text-hub-subtitle">
                                    Target seed URL
                                </CustomTypography.Text>
                            </CustomFlex>
                        </SessionMetricCard>
                    </CustomCol>

                    {/* 3. Tổng URLs phát hiện */}
                    <CustomCol xs={24} sm={12} lg={6}>
                        <SessionMetricCard
                            title="URLs Thu thập"
                            icon={
                                <CustomFlex
                                    align="center"
                                    justify="center"
                                    className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                >
                                    <Icon icon="lucide:link-2" className="text-sm" />
                                </CustomFlex>
                            }
                        >
                            <CustomFlex align="baseline" gap={8}>
                                <CustomTypography.Text className="text-2xl font-bold tracking-tight text-hub-title">
                                    {urlsCount}
                                </CustomTypography.Text>
                                <CustomTypography.Text className="text-xs text-hub-subtitle">
                                    ({queuedCount} đã enqueue)
                                </CustomTypography.Text>
                            </CustomFlex>
                        </SessionMetricCard>
                    </CustomCol>

                    {/* 4. Cấu hình & Thời gian */}
                    <CustomCol xs={24} sm={12} lg={6}>
                        <SessionMetricCard
                            title="Cấu hình phiên"
                            icon={
                                <CustomFlex
                                    align="center"
                                    justify="center"
                                    className="h-7 w-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400"
                                >
                                    <Icon icon="lucide:layers" className="text-sm" />
                                </CustomFlex>
                            }
                        >
                            <CustomFlex align="center" justify="space-between">
                                <CustomFlex vertical gap={1}>
                                    <CustomTypography.Text className="text-xs text-hub-subtitle">
                                        Độ sâu
                                    </CustomTypography.Text>
                                    <CustomTypography.Text
                                        strong
                                        className="text-sm text-hub-title"
                                    >
                                        Level {session?.depth || 1}
                                    </CustomTypography.Text>
                                </CustomFlex>
                                <CustomDivider type="vertical" className="h-6 !my-0" />
                                <CustomFlex vertical gap={1}>
                                    <CustomTypography.Text className="text-xs text-hub-subtitle">
                                        Thời lượng
                                    </CustomTypography.Text>
                                    <CustomTypography.Text
                                        strong
                                        className="text-sm text-hub-title"
                                    >
                                        {session?.durationSeconds || 0}s
                                    </CustomTypography.Text>
                                </CustomFlex>
                            </CustomFlex>
                        </SessionMetricCard>
                    </CustomCol>
                </CustomRow>
            </CustomFlex>
        </CustomCard>
    );
};
