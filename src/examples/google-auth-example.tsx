import React from 'react';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { GoogleLoginButton, UserProfile, ProtectedRoute } from '@/components/auth';

// Component hiển thị thông tin user và permissions
function UserInfo() {
    const { user, permissions, checkPermissions } = useGoogleAuth();

    if (!user) return null;

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Thông tin người dùng</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Profile */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Hồ sơ</h3>
                    <div className="flex items-center space-x-4">
                        <img
                            src={user.picture}
                            alt={user.name}
                            className="w-16 h-16 rounded-full border-2 border-gray-200"
                        />
                        <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            {user.verified_email && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                                    <svg
                                        className="w-3 h-3 mr-1"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Email đã xác thực
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Tên đầy đủ:</span>
                            <span className="text-sm font-medium">{user.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Tên:</span>
                            <span className="text-sm font-medium">{user.given_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Họ:</span>
                            <span className="text-sm font-medium">{user.family_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Ngôn ngữ:</span>
                            <span className="text-sm font-medium">{user.locale}</span>
                        </div>
                    </div>
                </div>

                {/* Permissions */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Quyền truy cập</h3>
                        <button
                            onClick={checkPermissions}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                        >
                            Làm mới
                        </button>
                    </div>

                    {permissions ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <svg
                                        className="w-5 h-5 text-gray-600"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                                    </svg>
                                    <span className="text-sm font-medium">Google Drive</span>
                                </div>
                                <span
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                        permissions.hasDriveAccess
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}
                                >
                                    {permissions.hasDriveAccess ? 'Có quyền' : 'Không có quyền'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <svg
                                        className="w-5 h-5 text-gray-600"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <span className="text-sm font-medium">Trạng thái ủy quyền</span>
                                </div>
                                <span
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                        permissions.isAuthorized
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}
                                >
                                    {permissions.isAuthorized ? 'Đã ủy quyền' : 'Chưa ủy quyền'}
                                </span>
                            </div>

                            {permissions.permissions.length > 0 && (
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm font-medium text-gray-900 mb-2">
                                        Các quyền đã cấp:
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                        {permissions.permissions.map((permission, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                            >
                                                {permission}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <svg
                                className="w-8 h-8 mx-auto mb-2 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <p>Chưa có thông tin quyền truy cập</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Component demo cho Google Auth
export function GoogleAuthExample() {
    const { isAuthenticated, loading, error } = useGoogleAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <h1 className="text-xl font-semibold text-gray-900">Google Auth Demo</h1>
                        <UserProfile />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-5 w-5 text-red-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Có lỗi xảy ra</h3>
                                <div className="mt-2 text-sm text-red-700">{error}</div>
                            </div>
                        </div>
                    </div>
                )}

                {isAuthenticated ? (
                    <UserInfo />
                ) : (
                    <div className="text-center py-12">
                        <div className="max-w-md mx-auto">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Chào mừng bạn</h2>
                            <p className="text-gray-600 mb-8">
                                Đăng nhập để xem thông tin chi tiết và quyền truy cập của bạn
                            </p>
                            <GoogleLoginButton size="lg" />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

// Component demo với Protected Route
export function ProtectedRouteExample() {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Trang được bảo vệ</h1>
                    <p className="text-gray-600 mb-4">
                        Bạn đã đăng nhập thành công và có quyền truy cập vào trang này!
                    </p>
                    <UserInfo />
                </div>
            </div>
        </ProtectedRoute>
    );
}

export default GoogleAuthExample;
