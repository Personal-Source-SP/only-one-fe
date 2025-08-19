'use client';

import { useMainContext } from '@/contexts/MainContext';
import { Button, Input } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomeClient() {
    const router = useRouter();
    const { token, handleLogin } = useMainContext();

    useEffect(() => {
        if (token) {
            router.push('/album');
        }
    }, [token, router]);

    const handleSubmit = async (values: { email: string; password: string }) => {
        try {
            const result = await handleLogin(values.email, values.password);

            if (result) {
                router.push('/album');
            } else {
                console.error('Đăng nhập thất bại');
            }
        } catch (error) {
            console.error('Có lỗi xảy ra khi đăng nhập');
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gradient-to-r from-purple-500 to-red-500">
            <div className="text-center">
                <div className="mb-6">
                    <img
                        width={60}
                        height={60}
                        alt="Profile"
                        src="/assets/logo.webp"
                        className="rounded-full mx-auto"
                    />
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.currentTarget as HTMLFormElement & {
                            email: HTMLInputElement;
                            password: HTMLInputElement;
                        };
                        handleSubmit({ email: form.email.value, password: form.password.value });
                    }}
                    className="flex flex-col items-center gap-3"
                >
                    <Input
                        name="email"
                        size="lg"
                        placeholder="Email"
                        className="w-72"
                        type="email"
                        isRequired
                    />
                    <Input
                        name="password"
                        size="lg"
                        className="w-72"
                        placeholder="Mật khẩu"
                        type="password"
                        isRequired
                    />
                    <Button size="lg" color="primary" className="w-72" type="submit">
                        Đăng nhập
                    </Button>
                </form>
            </div>
        </div>
    );
}
