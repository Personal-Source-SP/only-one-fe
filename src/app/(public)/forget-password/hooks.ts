'use client';

import { useCallback } from 'react';

import { useMainContext } from '@/contexts/MainContext';
import type { IAuthForgetPasswordFormValues } from '@/interfaces';

export const useForgetPasswordPage = () => {
    const { handleNotification } = useMainContext();

    const handleSubmit = useCallback(
        async (_values: IAuthForgetPasswordFormValues) => {
            handleNotification({
                message: 'Đã gửi liên kết khôi phục',
                description: 'Vui lòng kiểm tra hộp thư email của bạn.',
            });
        },
        [handleNotification],
    );

    return {
        handleSubmit,
    };
};
