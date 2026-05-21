'use client';

import { useCallback, useState } from 'react';

import { useMainContext } from '@/contexts/MainContext';
import { NotificationType } from '@/enums';
import { useLogin } from '@refinedev/core';
import { useRouter } from 'next/navigation';

import {
    CustomButton,
    CustomCheckbox,
    CustomForm,
    CustomInput,
    CustomLink,
} from '@/components/custom';
import { KEY_SESSION_STORAGE, mapNextAuthSignInErrorMessage } from '@/constants';
import { IAuth } from '@/interfaces';

import { AuthSocialLogin } from './AuthSocialLogin';

export const LoginForm = () => {
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

    return (
        <>
            <CustomForm className="space-y-1" layout="vertical" onFinish={handleLogin}>
                <CustomForm.Item
                    label="Email"
                    name="email"
                    rules={[{ required: true, message: 'Vui lòng nhập email' }]}
                >
                    <CustomInput placeholder="Nhập email của bạn" type="email" />
                </CustomForm.Item>

                <CustomForm.Item
                    label="Mật khẩu"
                    name="password"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                >
                    <CustomInput.Password placeholder="Nhập mật khẩu của bạn" />
                </CustomForm.Item>

                <div className="mb-4 flex items-center justify-between">
                    <CustomCheckbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                    >
                        Ghi nhớ đăng nhập
                    </CustomCheckbox>
                    <CustomLink href="/forget-password">Quên mật khẩu?</CustomLink>
                </div>
                <CustomButton
                    block
                    htmlType="submit"
                    loading={isPending}
                    size="large"
                    type="primary"
                >
                    Đăng nhập
                </CustomButton>
            </CustomForm>

            <AuthSocialLogin googleLabel="Đăng nhập với Google" />
        </>
    );
};
