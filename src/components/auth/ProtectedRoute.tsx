import React from 'react';
import { useRouter } from 'next/navigation';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { GoogleLoginButton } from './GoogleLoginButton';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requirePermissions?: boolean;
    fallback?: React.ReactNode;
}

export function ProtectedRoute({
    children,
    requirePermissions = true,
    fallback,
}: ProtectedRouteProps) {
    const { isAuthenticated, loading, permissions, user } = useGoogleAuth();
    const router = useRouter();

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
                </div>
            </div>
        );
    }

    // Not authenticated
    if (!isAuthenticated) {
        if (fallback) {
            return <>{fallback}</>;
        }

        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full space-y-8 p-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Chào mừng bạn</h2>
                        <p className="text-gray-600 mb-8">
                            Vui lòng đăng nhập để tiếp tục sử dụng hệ thống
                        </p>
                    </div>

                    <div className="space-y-4">
                        <GoogleLoginButton size="lg" className="w-full">
                            Đăng nhập với Google
                        </GoogleLoginButton>

                        <div className="text-center">
                            <p className="text-sm text-gray-500">
                                Bằng cách đăng nhập, bạn đồng ý với{' '}
                                <a href="#" className="text-blue-600 hover:underline">
                                    Điều khoản sử dụng
                                </a>{' '}
                                và{' '}
                                <a href="#" className="text-blue-600 hover:underline">
                                    Chính sách bảo mật
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Check permissions if required
    if (requirePermissions && permissions && !permissions.isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full space-y-8 p-8">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                            <svg
                                className="h-6 w-6 text-yellow-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Cần cấp quyền truy cập
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Để sử dụng hệ thống, bạn cần cấp quyền truy cập Google Drive.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Thử lại
                        </button>

                        <button
                            onClick={() => router.push('/login')}
                            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Đăng nhập lại
                        </button>
                    </div>

                    {user && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <img
                                    src={user.picture}
                                    alt={user.name}
                                    className="w-8 h-8 rounded-full"
                                />
                                <div className="text-sm">
                                    <p className="font-medium text-gray-900">{user.name}</p>
                                    <p className="text-gray-500">{user.email}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // User is authenticated and has required permissions
    return <>{children}</>;
}
