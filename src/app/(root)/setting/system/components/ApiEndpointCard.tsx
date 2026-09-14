'use client';

import {
    CustomButton,
    CustomCard,
    CustomFlex,
    CustomInput,
    customMessage,
    CustomTag,
    CustomTooltip,
    CustomTypography,
} from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTunnel } from '../hooks/useTunnel';
import { TunnelConfigModal } from './TunnelConfigModal';

export const ApiEndpointCard = () => {
    const {
        config,
        loading,
        statusData,
        isConfigModalOpen,
        handleStop,
        handleStart,
        handleSaveConfig,
        setIsConfigModalOpen,
    } = useTunnel();

    const [localEndpoint, setLocalEndpoint] = useState('http://localhost:4000');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setLocalEndpoint(window.location.origin);
        }
    }, []);

    const isConnected = useMemo(
        () => statusData.status === 'connected' && Boolean(statusData.url),
        [statusData.status, statusData.url],
    );

    const isStarting = useMemo(
        () => statusData.status === 'starting' || loading,
        [statusData.status, loading],
    );

    const cardTitle = useMemo(
        () => (
            <CustomFlex align="center" gap={8} className="text-hub-title font-semibold">
                <Icon icon="noto:sparkles" className="text-lg" />
                <CustomTypography.Text strong className="text-inherit">
                    Application & Tunnel Endpoint
                </CustomTypography.Text>
            </CustomFlex>
        ),
        [],
    );

    const tunnelTagClassName = useMemo(() => {
        const baseClass = 'w-20 text-center font-mono font-medium border-none py-1';
        if (isConnected) {
            return `${baseClass} bg-emerald-500/10 text-emerald-500 font-semibold`;
        }
        return `${baseClass} bg-hub-section-muted text-hub-muted`;
    }, [isConnected]);

    const copyToClipboard = useCallback((text: string, label: string) => {
        navigator.clipboard.writeText(text);
        customMessage.success(`Đã sao chép ${label} vào clipboard`);
    }, []);

    const handleOpenConfigModal = useCallback(() => {
        setIsConfigModalOpen(true);
    }, [setIsConfigModalOpen]);

    const handleCloseConfigModal = useCallback(() => {
        setIsConfigModalOpen(false);
    }, [setIsConfigModalOpen]);

    const handleCopyLocalEndpoint = useCallback(() => {
        copyToClipboard(localEndpoint, 'Local Endpoint');
    }, [copyToClipboard, localEndpoint]);

    const handleCopyTunnelEndpoint = useCallback(() => {
        copyToClipboard(statusData.url || '', 'Tunnel Endpoint');
    }, [copyToClipboard, statusData.url]);

    return (
        <>
            <CustomCard
                title={cardTitle}
                className="w-full rounded-hub-card border-hub-border-card bg-hub-section shadow-sm"
            >
                <CustomFlex vertical gap="middle">
                    {/* Row 1: Local Endpoint */}
                    <CustomFlex align="center" gap={12} className="w-full">
                        <CustomTag className="w-20 text-center font-mono font-medium text-hub-muted bg-hub-section-muted border-none py-1">
                            Local
                        </CustomTag>
                        <CustomFlex flex={1}>
                            <CustomInput
                                readOnly
                                value={localEndpoint}
                                className="font-mono text-sm bg-hub-card text-hub-title"
                                suffix={
                                    <CustomTooltip title="Sao chép Local Endpoint">
                                        <Icon
                                            icon="lucide:copy"
                                            onClick={handleCopyLocalEndpoint}
                                            className="cursor-pointer text-hub-muted hover:text-hub-primary transition-colors"
                                        />
                                    </CustomTooltip>
                                }
                            />
                        </CustomFlex>
                    </CustomFlex>

                    {/* Row 2: Tunnel Endpoint */}
                    <CustomFlex align="center" gap={12} className="w-full">
                        <CustomTag className={tunnelTagClassName}>Tunnel</CustomTag>

                        {isConnected ? (
                            <CustomFlex flex={1} align="center" gap="middle">
                                <CustomInput
                                    readOnly
                                    value={statusData.url || ''}
                                    className="font-mono text-sm bg-hub-card text-hub-title flex-1"
                                    suffix={
                                        <CustomTooltip title="Sao chép Tunnel Endpoint">
                                            <Icon
                                                icon="lucide:copy"
                                                onClick={handleCopyTunnelEndpoint}
                                                className="cursor-pointer text-hub-muted hover:text-hub-primary transition-colors"
                                            />
                                        </CustomTooltip>
                                    }
                                />
                                <CustomButton
                                    danger
                                    loading={loading}
                                    onClick={handleStop}
                                    icon={<Icon icon="lucide:square" className="text-sm" />}
                                >
                                    Ngắt kết nối
                                </CustomButton>
                            </CustomFlex>
                        ) : (
                            <CustomFlex flex={1} align="center" gap="small">
                                <CustomButton
                                    type="primary"
                                    loading={isStarting}
                                    onClick={handleStart}
                                    icon={<Icon icon="lucide:cloud" className="text-base" />}
                                >
                                    {isStarting ? 'Đang kết nối...' : 'Enable'}
                                </CustomButton>

                                <CustomButton
                                    type="text"
                                    icon={
                                        <Icon
                                            icon="lucide:settings"
                                            className="text-base text-hub-muted"
                                        />
                                    }
                                    onClick={handleOpenConfigModal}
                                    className="hover:text-hub-primary"
                                >
                                    Cấu hình
                                </CustomButton>
                            </CustomFlex>
                        )}
                    </CustomFlex>

                    {/* Status hint / Error */}
                    {statusData.status === 'error' && (
                        <CustomFlex align="center" gap={6} className="mt-1 text-xs text-red-500">
                            <Icon icon="lucide:alert-circle" />
                            <CustomTypography.Text type="danger" className="text-xs">
                                {statusData.error}
                            </CustomTypography.Text>
                        </CustomFlex>
                    )}
                </CustomFlex>
            </CustomCard>

            <TunnelConfigModal
                open={isConfigModalOpen}
                initialValues={config}
                onSave={handleSaveConfig}
                onCancel={handleCloseConfigModal}
            />
        </>
    );
};
