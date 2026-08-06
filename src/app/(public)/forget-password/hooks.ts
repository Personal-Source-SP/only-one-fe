'use client';

import { useCallback } from 'react';
import { useMainContext } from '@/contexts/MainContext';
import { IAuth } from '@/interfaces';

export const useForgetPasswordPage = () => {
    const { handleNotification } = useMainContext();

    const handleSubmit = useCallback(
        async (_values: IAuth.IForgetPasswordFormValues) => {
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
