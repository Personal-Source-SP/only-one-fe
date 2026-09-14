'use client';

import { useCallback, useMemo, useState } from 'react';
import { API_ENDPOINT } from '@/config';
import { useCustomData, useCustomMutationData } from '@/hooks';
import { DEFAULT_TUNNEL_CONFIG, DEFAULT_TUNNEL_STATUS } from '../constants';
import type { TunnelConfigDto, TunnelStatusResponse } from '../types';

export const useTunnel = () => {
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

    const { data: configData, query: configQuery } = useCustomData<TunnelConfigDto>({
        url: API_ENDPOINT.SETTINGS.TUNNEL_CONFIG,
    });

    const { data: rawStatusData, query: statusQuery } = useCustomData<TunnelStatusResponse>({
        url: API_ENDPOINT.TUNNEL.STATUS,
        errorNotification: false,
        queryOptions: {
            refetchInterval: (query) => {
                const data = query.state.data as any;
                const status = data?.data?.status ?? data?.status;
                return status === 'starting' ? 2000 : false;
            },
        },
    });

    const { handleCustomMutationData: mutateTunnel, mutation: tunnelMutation } =
        useCustomMutationData({
            onSuccess: () => {
                statusQuery.refetch();
            },
        });

    const { handleCustomMutationData: mutateConfig, mutation: configMutation } =
        useCustomMutationData({
            onSuccess: () => {
                setIsConfigModalOpen(false);
                configQuery.refetch();
            },
        });

    const config = useMemo<TunnelConfigDto>(
        () => ({
            mode: configData?.mode || DEFAULT_TUNNEL_CONFIG.mode,
            token: configData?.token || DEFAULT_TUNNEL_CONFIG.token,
            customUrl: configData?.customUrl || DEFAULT_TUNNEL_CONFIG.customUrl,
        }),
        [configData],
    );

    const statusData = useMemo<TunnelStatusResponse>(
        () => ({
            url: rawStatusData?.url || DEFAULT_TUNNEL_STATUS.url,
            mode: rawStatusData?.mode || DEFAULT_TUNNEL_STATUS.mode,
            error: rawStatusData?.error || DEFAULT_TUNNEL_STATUS.error,
            status: rawStatusData?.status || DEFAULT_TUNNEL_STATUS.status,
        }),
        [rawStatusData],
    );

    const handleStart = useCallback(async () => {
        await mutateTunnel({
            method: 'post',
            values: config,
            url: API_ENDPOINT.TUNNEL.START,
            successMessage: 'Đang khởi động Cloudflare Tunnel...',
        });
    }, [config, mutateTunnel]);

    const handleStop = useCallback(async () => {
        await mutateTunnel({
            method: 'post',
            values: {},
            url: API_ENDPOINT.TUNNEL.STOP,
            successMessage: 'Đã dừng Tunnel',
        });
    }, [mutateTunnel]);

    const handleSaveConfig = useCallback(
        async (newConfig: TunnelConfigDto) => {
            await mutateConfig({
                method: 'put',
                values: newConfig,
                url: API_ENDPOINT.SETTINGS.TUNNEL_CONFIG,
                successMessage: 'Đã lưu cấu hình Tunnel vào tài khoản',
            });
        },
        [mutateConfig],
    );

    return {
        config,
        statusData,
        isConfigModalOpen,
        loading: tunnelMutation.mutation.isPending || configMutation.mutation.isPending,
        handleStart,
        handleStop,
        handleSaveConfig,
        setIsConfigModalOpen,
        refreshStatus: statusQuery.refetch,
    };
};
