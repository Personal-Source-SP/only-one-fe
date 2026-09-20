'use client';

import { useCallback, useMemo } from 'react';
import { Icon } from '@iconify/react';

import {
    CustomButton,
    CustomCard,
    CustomFlex,
    customMessage,
    CustomSpace,
    CustomTypography,
} from '@/components';

import type { IOnvifMetadata } from '../types';

const { Text } = CustomTypography;

type OnvifProfilesListProps = {
    onvif?: IOnvifMetadata | null;
};

export const OnvifProfilesList = ({ onvif }: OnvifProfilesListProps) => {
    if (!onvif) return null;

    const handleCopy = useCallback((text: string, label: string) => {
        navigator.clipboard.writeText(text);
        customMessage.success(`Đã sao chép ${label}`);
    }, []);

    const streamProfiles = useMemo(() => onvif.streamProfiles, [onvif.streamProfiles]);

    return (
        <div>
            <Text strong className="block mb-2 text-sm">
                📹 Siêu dữ liệu ONVIF (Profiles & RTSP Streams):
            </Text>

            {streamProfiles && streamProfiles.length > 0 ? (
                <CustomSpace direction="vertical" size="small" className="w-full">
                    {streamProfiles.map((p, idx) => (
                        <CustomCard
                            key={idx}
                            size="small"
                            className="bg-slate-50 dark:bg-slate-900"
                        >
                            <CustomFlex justify="space-between" align="center" className="mb-2">
                                <Text strong className="text-blue-600">
                                    [{p.name || p.token}] {p.videoEncoding || 'H.264'}
                                    {p.resolution &&
                                        ` - ${p.resolution.width}x${p.resolution.height}`}
                                    {p.frameRateLimit && ` @ ${p.frameRateLimit}fps`}
                                </Text>
                            </CustomFlex>
                            {p.streamUri && (
                                <CustomFlex
                                    gap="small"
                                    align="center"
                                    className="mb-1"
                                    justify="space-between"
                                >
                                    <Text className="text-xs break-all" type="secondary">
                                        RTSP: {p.streamUri}
                                    </Text>
                                    <CustomButton
                                        size="small"
                                        type="text"
                                        icon={<Icon icon="mdi:content-copy" />}
                                        onClick={() => handleCopy(p.streamUri!, 'RTSP URL')}
                                    >
                                        Copy
                                    </CustomButton>
                                </CustomFlex>
                            )}
                            {p.snapshotUri && (
                                <CustomFlex justify="space-between" align="center" gap="small">
                                    <Text className="text-xs break-all" type="secondary">
                                        Snapshot: {p.snapshotUri}
                                    </Text>
                                    <CustomButton
                                        size="small"
                                        type="text"
                                        icon={<Icon icon="mdi:content-copy" />}
                                        onClick={() => handleCopy(p.snapshotUri!, 'Snapshot URL')}
                                    >
                                        Copy
                                    </CustomButton>
                                </CustomFlex>
                            )}
                        </CustomCard>
                    ))}
                </CustomSpace>
            ) : (
                <Text type="secondary" className="text-xs">
                    Chưa có profile luồng video nào được trích xuất.
                </Text>
            )}
        </div>
    );
};
