import React from 'react';
import {
    CustomButton,
    CustomCheckbox,
    CustomForm,
    CustomInput,
    CustomLink,
} from '@/components/custom-antd';
import { AuthSocialLogin } from '@/app/(public)/_components/auth/AuthSocialLogin';
import { useLoginPage } from '@/app/(public)/login/hooks';

export const LoginForm = () => {
    const { isPending, rememberMe, setRememberMe, handleLogin } = useLoginPage();

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
