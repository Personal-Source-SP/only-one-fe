'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLogin } from '@refinedev/core';
import { useMainContext } from '@/contexts/MainContext';
import { NotificationType } from '@/enums';
import { KEY_SESSION_STORAGE, mapNextAuthSignInErrorMessage } from '@/constants';
import { IAuth } from '@/interfaces';

export const useLoginPage = () => {
    const { isPending, mutate: login } = useLogin();
    const router = useRouter();
    const { handleNotification } = useMainContext();
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = useCallback(
        async (values: IAuth.ILoginRequest) => {
            login(
                {
                    email: values.email,
                    password: values.password,
                },
                {
                    onSuccess: (data) => {
                        if (data?.success) {
                            const returnUrl = sessionStorage.getItem(
                                KEY_SESSION_STORAGE.RETURN_URL,
                            );
                            if (returnUrl) {
                                sessionStorage.removeItem(KEY_SESSION_STORAGE.RETURN_URL);
                                router.push(returnUrl);
                            } else {
                                router.push('/dashboard');
                            }
                        }
                    },
                    onError: (error) => {
                        handleNotification({
                            type: NotificationType.ERROR,
                            message: mapNextAuthSignInErrorMessage(error?.message),
                        });
                    },
                },
            );
        },
        [handleNotification, login, router],
    );

    return {
        isPending,
        rememberMe,
        setRememberMe,
        handleLogin,
    };
};
