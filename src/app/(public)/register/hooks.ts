'use client';

import { useCallback } from 'react';

import { CustomForm } from '@/components';
import { useMainContext } from '@/contexts/MainContext';
import { NotificationType } from '@/enums';
import type { IAuthRegisterFormValues } from '@/interfaces';

export const useRegisterPage = () => {
    const { handleNotification } = useMainContext();
    const [form] = CustomForm.useForm<IAuthRegisterFormValues>();

    const handleRegister = useCallback(
        async (_values: IAuthRegisterFormValues) => {
            handleNotification({
                type: NotificationType.INFO,
                message: 'Tính năng đang được phát triển',
                description: 'Đăng ký tài khoản sẽ sớm được hỗ trợ.',
            });
        },
        [handleNotification],
    );

    return {
        form,
        handleRegister,
    };
};
