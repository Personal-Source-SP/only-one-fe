import React, { useState } from 'react';
import { useMainContext } from '@/contexts/MainContext';
import { GoogleLoginButton } from '@/components/auth';

export function MainContextExample() {
    const {
        user,
        googleUser,
        isAuthenticated,
        loading,
        handleLogin,
        handleGoogleLogin,
        handleLogout,
    } = useMainContext();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');

        if (!email || !password) {
            setLoginError('Vui lòng nhập email và mật khẩu');
            return;
        }

        const success = await handleLogin(email, password);
        if (!success) {
            setLoginError('Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.');
        }
    };

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

    if (isAuthenticated && user) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Thông tin người dùng
                            </h1>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                                Đăng xuất
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* User Info from Database */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                                    Thông tin từ Database
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        {user.picture && (
                                            <img
                                                src={user.picture}
                                                alt={user.name}
                                                className="w-12 h-12 rounded-full border-2 border-gray-200"
                                            />
                                        )}
                                        <div>
                                            <p className="font-medium text-gray-900">{user.name}</p>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Vai trò:</span>
                                            <span
                                                className={`text-sm font-medium px-2 py-1 rounded-full ${
                                                    user.role === 'admin'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                }`}
                                            >
                                                {user.role === 'admin'
                                                    ? 'Quản trị viên'
                                                    : 'Người dùng'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">
                                                Trạng thái:
                                            </span>
                                            <span
                                                className={`text-sm font-medium px-2 py-1 rounded-full ${
                                                    user.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}
                                            >
                                                {user.isActive ? 'Hoạt động' : 'Không hoạt động'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Ngày tạo:</span>
                                            <span className="text-sm font-medium">
                                                {user.createdAt instanceof Date
                                                    ? user.createdAt.toLocaleDateString('vi-VN')
                                                    : new Date(user.createdAt).toLocaleDateString(
                                                          'vi-VN',
                                                      )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">
                                                Cập nhật lần cuối:
                                            </span>
                                            <span className="text-sm font-medium">
                                                {user.updatedAt instanceof Date
                                                    ? user.updatedAt.toLocaleDateString('vi-VN')
                                                    : new Date(user.updatedAt).toLocaleDateString(
                                                          'vi-VN',
                                                      )}
                                            </span>
                                        </div>
                                        {user.lastLoginAt && (
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">
                                                    Đăng nhập lần cuối:
                                                </span>
                                                <span className="text-sm font-medium">
                                                    {user.lastLoginAt instanceof Date
                                                        ? user.lastLoginAt.toLocaleDateString(
                                                              'vi-VN',
                                                          )
                                                        : new Date(
                                                              user.lastLoginAt,
                                                          ).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Google User Info */}
                            {googleUser && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                                        Thông tin Google
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-3">
                                            <img
                                                src={googleUser.picture}
                                                alt={googleUser.name}
                                                className="w-12 h-12 rounded-full border-2 border-gray-200"
                                            />
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {googleUser.name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {googleUser.email}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Tên:</span>
                                                <span className="text-sm font-medium">
                                                    {googleUser.given_name}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Họ:</span>
                                                <span className="text-sm font-medium">
                                                    {googleUser.family_name}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">
                                                    Email đã xác thực:
                                                </span>
                                                <span
                                                    className={`text-sm font-medium px-2 py-1 rounded-full ${
                                                        googleUser.verified_email
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                    }`}
                                                >
                                                    {googleUser.verified_email
                                                        ? 'Đã xác thực'
                                                        : 'Chưa xác thực'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">
                                                    Ngôn ngữ:
                                                </span>
                                                <span className="text-sm font-medium">
                                                    {googleUser.locale}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin xác thực</h2>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Trạng thái đăng nhập:</span>
                                <span
                                    className={`text-sm font-medium px-2 py-1 rounded-full ${
                                        isAuthenticated
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}
                                >
                                    {isAuthenticated ? 'Đã đăng nhập' : 'Chưa đăng nhập'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">
                                    Phương thức đăng nhập:
                                </span>
                                <span className="text-sm font-medium">
                                    {googleUser ? 'Google OAuth' : 'Email/Password'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Đăng nhập</h2>
                    <p className="text-gray-600">Vui lòng đăng nhập để tiếp tục</p>
                </div>

                <div className="space-y-6">
                    {/* Google Login */}
                    <div>
                        <GoogleLoginButton size="lg" className="w-full">
                            Đăng nhập với Google
                        </GoogleLoginButton>
                    </div>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-gray-50 text-gray-500">Hoặc</span>
                        </div>
                    </div>

                    {/* Email/Password Login */}
                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Nhập email của bạn"
                                required
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Mật khẩu
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Nhập mật khẩu của bạn"
                                required
                            />
                        </div>

                        {loginError && (
                            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">
                                {loginError}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Đăng nhập
                        </button>
                    </form>
                </div>

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
    );
}

export default MainContextExample;
