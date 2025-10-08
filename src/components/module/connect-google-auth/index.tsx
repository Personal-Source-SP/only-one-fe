'use client';

import { CustomModal } from '@/components/common';
import { KEY_LOCAL_STORAGE } from '@/constants';
import { Button, Space, Typography } from 'antd';
import type { FC } from 'react';
import { memo } from 'react';
import { useCallback, useEffect, useState } from 'react';

type ConnectGoogleAuthProps = {
    connectUrl: string;
};

const ConnectGoogleAuth: FC<ConnectGoogleAuthProps> = ({ connectUrl }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

    const getExpiryTimestamp = useCallback((): number | null => {
        if (typeof window === 'undefined') return null;
        const raw = localStorage.getItem(KEY_LOCAL_STORAGE.GOOGLE_TOKEN_EXPIRY);
        if (!raw) return null;
        const parsed = Number(raw);
        return Number.isFinite(parsed) ? parsed : null;
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const token = localStorage.getItem(KEY_LOCAL_STORAGE.GOOGLE_ACCESS_TOKEN);
        const expiry = getExpiryTimestamp();
        const valid = Boolean(token && expiry && Date.now() < (expiry as number));
        setIsOpen(!valid);
    }, [getExpiryTimestamp]);

    useEffect(() => {
        const updateCountdown = () => {
            const expiry = getExpiryTimestamp();
            if (!expiry) {
                setSecondsLeft(null);
                return;
            }
            const diffMs = expiry - Date.now();
            setSecondsLeft(diffMs > 0 ? Math.floor(diffMs / 1000) : 0);
        };

        updateCountdown();
        const id = setInterval(updateCountdown, 1000);
        return () => clearInterval(id);
    }, [getExpiryTimestamp]);

    const onConnect = useCallback(() => {
        if (!connectUrl) return;
        window.location.href = connectUrl;
    }, [connectUrl]);

    return (
        <CustomModal
            modalProps={{
                open: isOpen,
                title: 'Kết nối Google',
                closable: false,
                maskClosable: false,
            }}
        >
            <Space direction="vertical" size={16} className="w-full">
                <Typography.Title level={4} className="!mb-0">
                    Yêu cầu kết nối Google Drive
                </Typography.Title>
                <Typography.Paragraph className="!mb-0">
                    Bạn cần cấp quyền để đồng bộ hóa dữ liệu với Google Drive. Nếu đã kết nối, token
                    có thể đã hết hạn.
                </Typography.Paragraph>
                {secondsLeft !== null && secondsLeft > 0 && (
                    <Typography.Text type="secondary">
                        Token hiện tại còn hiệu lực khoảng {secondsLeft}s
                    </Typography.Text>
                )}
                <div className="flex gap-3">
                    <Button type="primary" size="large" onClick={onConnect}>
                        Kết nối Google
                    </Button>
                </div>
            </Space>
        </CustomModal>
    );
};

export default memo(ConnectGoogleAuth);
