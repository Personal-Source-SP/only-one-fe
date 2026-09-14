'use client';

import { FC, useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import {
    CustomButton,
    CustomCard,
    CustomFlex,
    CustomInput,
    customMessage,
    CustomTag,
    CustomTooltip,
} from '@/components/custom-antd';
import { useTunnel } from '../hooks/useTunnel';
import { TunnelConfigModal } from './TunnelConfigModal';

export const ApiEndpointCard: FC = () => {
    const {
        statusData,
        config,
        loading,
        isConfigModalOpen,
        setIsConfigModalOpen,
        handleStart,
        handleStop,
        handleSaveConfig,
    } = useTunnel();

    const [localEndpoint, setLocalEndpoint] = useState('http://localhost:4000');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setLocalEndpoint(window.location.origin);
        }
    }, []);

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        customMessage.success(`Đã sao chép ${label} vào clipboard`);
    };

    const isConnected = statusData.status === 'connected' && Boolean(statusData.url);
    const isStarting = statusData.status === 'starting' || loading;

    return (
        <>
            <CustomCard
                title={
                    <CustomFlex align="center" gap={8} className="text-hub-title font-semibold">
                        <Icon icon="noto:sparkles" className="text-lg" />
                        <span>Application & Tunnel Endpoint</span>
                    </CustomFlex>
                }
                className="w-full rounded-hub-card border-hub-border-card bg-hub-section shadow-sm"
            >
                <div className="flex flex-col gap-4">
                    {/* Row 1: Local Endpoint */}
                    <CustomFlex align="center" gap={12} className="w-full">
                        <CustomTag className="w-20 text-center font-mono font-medium text-hub-muted bg-hub-section-muted border-none py-1">
                            Local
                        </CustomTag>
                        <div className="flex-1">
                            <CustomInput
                                readOnly
                                value={localEndpoint}
                                className="font-mono text-sm bg-hub-card text-hub-title"
                                suffix={
                                    <CustomTooltip title="Sao chép Local Endpoint">
                                        <Icon
                                            icon="lucide:copy"
                                            className="cursor-pointer text-hub-muted hover:text-hub-primary transition-colors"
                                            onClick={() =>
                                                copyToClipboard(localEndpoint, 'Local Endpoint')
                                            }
                                        />
                                    </CustomTooltip>
                                }
                            />
                        </div>
                    </CustomFlex>

                    {/* Row 2: Tunnel Endpoint */}
                    <CustomFlex align="center" gap={12} className="w-full">
                        <CustomTag
                            className={`w-20 text-center font-mono font-medium border-none py-1 ${
                                isConnected
                                    ? 'bg-emerald-500/10 text-emerald-500 font-semibold'
                                    : 'bg-hub-section-muted text-hub-muted'
                            }`}
                        >
                            Tunnel
                        </CustomTag>

                        {isConnected ? (
                            <div className="flex-1 flex items-center gap-3">
                                <CustomInput
                                    readOnly
                                    value={statusData.url || ''}
                                    className="font-mono text-sm bg-hub-card text-hub-title flex-1"
                                    suffix={
                                        <CustomTooltip title="Sao chép Tunnel Endpoint">
                                            <Icon
                                                icon="lucide:copy"
                                                className="cursor-pointer text-hub-muted hover:text-hub-primary transition-colors"
                                                onClick={() =>
                                                    copyToClipboard(
                                                        statusData.url || '',
                                                        'Tunnel Endpoint',
                                                    )
                                                }
                                            />
                                        </CustomTooltip>
                                    }
                                />
                                <CustomButton
                                    danger
                                    onClick={handleStop}
                                    loading={loading}
                                    icon={<Icon icon="lucide:square" className="text-sm" />}
                                >
                                    Ngắt kết nối
                                </CustomButton>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={isStarting}
                                    onClick={handleStart}
                                    className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                    <Icon icon="lucide:cloud" className="text-base" />
                                    <span>{isStarting ? 'Đang kết nối...' : 'Enable'}</span>
                                </button>

                                <CustomButton
                                    type="text"
                                    icon={
                                        <Icon
                                            icon="lucide:settings"
                                            className="text-base text-hub-muted"
                                        />
                                    }
                                    onClick={() => setIsConfigModalOpen(true)}
                                    className="hover:text-hub-primary"
                                >
                                    Cấu hình
                                </CustomButton>
                            </div>
                        )}
                    </CustomFlex>

                    {/* Status hint / Error */}
                    {statusData.status === 'error' && (
                        <div className="text-xs text-red-500 mt-1 flex items-center gap-1.5">
                            <Icon icon="lucide:alert-circle" />
                            <span>{statusData.error}</span>
                        </div>
                    )}
                </div>
            </CustomCard>

            <TunnelConfigModal
                open={isConfigModalOpen}
                initialValues={config}
                onCancel={() => setIsConfigModalOpen(false)}
                onSave={handleSaveConfig}
            />
        </>
    );
};
