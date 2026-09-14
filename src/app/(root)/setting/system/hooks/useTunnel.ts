'use client';

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { customMessage } from '@/components/custom-antd';
import { API_ENDPOINT } from '@/config';
import type { TunnelConfigDto, TunnelStatusResponse } from '../types';

export const useTunnel = () => {
    const [statusData, setStatusData] = useState<TunnelStatusResponse>({
        status: 'idle',
        url: null,
        mode: null,
        error: null,
    });
    const [config, setConfig] = useState<TunnelConfigDto>({
        mode: 'quick',
        token: '',
        customUrl: '',
    });
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchStatus = useCallback(async () => {
        try {
            const { data } = await axios.get<TunnelStatusResponse>('/api/tunnel/status');
            setStatusData(data);
        } catch {
            // Silently handle polling failure
        }
    }, []);

    const fetchConfig = useCallback(async () => {
        try {
            const { data } = await axios.get<TunnelConfigDto>(API_ENDPOINT.SETTINGS.TUNNEL_CONFIG);
            if (data && data.mode) {
                setConfig(data);
            }
        } catch {
            // No saved config
        }
    }, []);

    useEffect(() => {
        fetchStatus();
        fetchConfig();
    }, [fetchStatus, fetchConfig]);

    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (statusData.status === 'starting') {
            timer = setInterval(fetchStatus, 2000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [statusData.status, fetchStatus]);

    const handleStart = async () => {
        setLoading(true);
        try {
            const { data } = await axios.post<TunnelStatusResponse>('/api/tunnel/start', config);
            setStatusData(data);
            if (data.status === 'error') {
                customMessage.error(data.error || 'Khởi động Tunnel thất bại');
            } else {
                customMessage.success('Đang khởi động Cloudflare Tunnel...');
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string } } };
            customMessage.error(error?.response?.data?.error || 'Lỗi kết nối tới máy chủ');
        } finally {
            setLoading(false);
        }
    };

    const handleStop = async () => {
        setLoading(true);
        try {
            const { data } = await axios.post<TunnelStatusResponse>('/api/tunnel/stop');
            setStatusData(data);
            customMessage.info('Đã dừng Tunnel');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string } } };
            customMessage.error(error?.response?.data?.error || 'Lỗi khi dừng Tunnel');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveConfig = async (newConfig: TunnelConfigDto) => {
        try {
            await axios.put(API_ENDPOINT.SETTINGS.TUNNEL_CONFIG, newConfig);
            setConfig(newConfig);
            setIsConfigModalOpen(false);
            customMessage.success('Đã lưu cấu hình Tunnel vào tài khoản');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            customMessage.error(error?.response?.data?.message || 'Lỗi khi lưu cấu hình');
        }
    };

    return {
        statusData,
        config,
        loading,
        isConfigModalOpen,
        setIsConfigModalOpen,
        handleStart,
        handleStop,
        handleSaveConfig,
        refreshStatus: fetchStatus,
    };
};
