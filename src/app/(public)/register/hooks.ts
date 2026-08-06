'use client';

import { useCallback } from 'react';
import { useMainContext } from '@/contexts/MainContext';
import { NotificationType } from '@/enums';
import { CustomForm } from '@/components/custom';
import { IAuth } from '@/interfaces';

export const useRegisterPage = () => {
    const { handleNotification } = useMainContext();
    const [form] = CustomForm.useForm<IAuth.IRegisterFormValues>();

    const handleRegister = useCallback(
        async (_values: IAuth.IRegisterFormValues) => {
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
