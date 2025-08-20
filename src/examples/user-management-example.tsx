import React, { useState, useEffect } from 'react';
import { useMainContext } from '@/contexts/MainContext';
import { PasswordService } from '@/libs/password';

export function UserManagementExample() {
    const {
        user,
        isAuthenticated,
        loading,
        updateUserPassword,
        resetUserPassword,
        checkGoogleTokenStatus,
        refreshGoogleToken,
        createUser,
        updateUser,
    } = useMainContext();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [googleTokenStatus, setGoogleTokenStatus] = useState<any>(null);
    const [isCheckingToken, setIsCheckingToken] = useState(false);
    const [isRefreshingToken, setIsRefreshingToken] = useState(false);

    // Form cho tạo user mới
    const [newUserForm, setNewUserForm] = useState({
        email: '',
        name: '',
        password: '',
        role: 'user' as 'admin' | 'user',
        loginMethod: 'email' as 'email' | 'google' | 'both',
    });

    useEffect(() => {
        if (isAuthenticated && user) {
            checkTokenStatus();
        }
    }, [isAuthenticated, user]);

    const checkTokenStatus = async () => {
        if (!user) return;

        setIsCheckingToken(true);
        try {
            const status = await checkGoogleTokenStatus();
            setGoogleTokenStatus(status);
        } catch (error) {
            console.error('Error checking token status:', error);
        } finally {
            setIsCheckingToken(false);
        }
    };

    const handleRefreshToken = async () => {
        setIsRefreshingToken(true);
        try {
            const success = await refreshGoogleToken();
            if (success) {
                setPasswordSuccess('Google token đã được refresh thành công!');
                await checkTokenStatus(); // Kiểm tra lại status
            } else {
                setPasswordError('Không thể refresh Google token');
            }
        } catch (error) {
            setPasswordError('Có lỗi xảy ra khi refresh token');
        } finally {
            setIsRefreshingToken(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!user) return;

        setPasswordError('');
        setPasswordSuccess('');

        // Validate password
        if (newPassword !== confirmPassword) {
            setPasswordError('Mật khẩu xác nhận không khớp');
            return;
        }

        const validation = PasswordService.validatePasswordStrength(newPassword);
        if (!validation.isValid) {
            setPasswordError(`Mật khẩu không đủ mạnh: ${validation.errors.join(', ')}`);
            return;
        }

        try {
            const success = await updateUserPassword(user.id, newPassword);
            if (success) {
                setPasswordSuccess('Mật khẩu đã được cập nhật thành công!');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setPasswordError('Không thể cập nhật mật khẩu');
            }
        } catch (error) {
            setPasswordError('Có lỗi xảy ra khi cập nhật mật khẩu');
        }
    };

    const handleResetPassword = async () => {
        if (!user) return;

        setPasswordError('');
        setPasswordSuccess('');

        try {
            const result = await resetUserPassword(user.id);
            if (result.success && result.newPassword) {
                setPasswordSuccess(`Mật khẩu mới: ${result.newPassword}`);
            } else {
                setPasswordError(result.error || 'Không thể reset mật khẩu');
            }
        } catch (error) {
            setPasswordError('Có lỗi xảy ra khi reset mật khẩu');
        }
    };

    const handleCreateUser = async () => {
        setPasswordError('');
        setPasswordSuccess('');

        // Validate form
        if (!newUserForm.email || !newUserForm.name) {
            setPasswordError('Vui lòng điền đầy đủ thông tin');
            return;
        }

        if (newUserForm.loginMethod === 'email' && !newUserForm.password) {
            setPasswordError('Vui lòng nhập mật khẩu cho user');
            return;
        }

        if (newUserForm.password) {
            const validation = PasswordService.validatePasswordStrength(newUserForm.password);
            if (!validation.isValid) {
                setPasswordError(`Mật khẩu không đủ mạnh: ${validation.errors.join(', ')}`);
                return;
            }
        }

        try {
            const userId = await createUser({
                email: newUserForm.email,
                name: newUserForm.name,
                password: newUserForm.password,
                role: newUserForm.role,
                isActive: true,
                loginMethod: newUserForm.loginMethod,
            });

            setPasswordSuccess(`User đã được tạo thành công với ID: ${userId}`);
            setNewUserForm({
                email: '',
                name: '',
                password: '',
                role: 'user',
                loginMethod: 'email',
            });
        } catch (error) {
            setPasswordError('Có lỗi xảy ra khi tạo user');
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

    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Vui lòng đăng nhập</h2>
                    <p className="text-gray-600">Bạn cần đăng nhập để truy cập tính năng này</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* User Info */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Thông tin User</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p>
                                <strong>Email:</strong> {user.email}
                            </p>
                            <p>
                                <strong>Tên:</strong> {user.name}
                            </p>
                            <p>
                                <strong>Vai trò:</strong> {user.role}
                            </p>
                            <p>
                                <strong>Trạng thái:</strong>{' '}
                                {user.isActive ? 'Hoạt động' : 'Không hoạt động'}
                            </p>
                        </div>
                        <div>
                            <p>
                                <strong>Phương thức đăng nhập:</strong> {user.loginMethod}
                            </p>
                            <p>
                                <strong>Có password:</strong> {user.passwordHash ? 'Có' : 'Không'}
                            </p>
                            <p>
                                <strong>Có Google ID:</strong> {user.googleId ? 'Có' : 'Không'}
                            </p>
                            <p>
                                <strong>Ngày tạo:</strong>{' '}
                                {user.createdAt instanceof Date
                                    ? user.createdAt.toLocaleDateString('vi-VN')
                                    : new Date(user.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Google Token Status */}
                {user.googleId && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Trạng thái Google Token
                            </h2>
                            <button
                                onClick={checkTokenStatus}
                                disabled={isCheckingToken}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isCheckingToken ? 'Đang kiểm tra...' : 'Kiểm tra'}
                            </button>
                        </div>

                        {googleTokenStatus && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm font-medium text-gray-600">
                                            Trạng thái
                                        </p>
                                        <p
                                            className={`text-lg font-bold ${googleTokenStatus.isValid ? 'text-green-600' : 'text-red-600'}`}
                                        >
                                            {googleTokenStatus.isValid ? 'Hợp lệ' : 'Không hợp lệ'}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm font-medium text-gray-600">
                                            Cần refresh
                                        </p>
                                        <p
                                            className={`text-lg font-bold ${googleTokenStatus.needsRefresh ? 'text-yellow-600' : 'text-green-600'}`}
                                        >
                                            {googleTokenStatus.needsRefresh ? 'Có' : 'Không'}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm font-medium text-gray-600">
                                            Thời gian hết hạn
                                        </p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {user.googleTokenExpiry
                                                ? new Date(user.googleTokenExpiry).toLocaleString(
                                                      'vi-VN',
                                                  )
                                                : 'Không có'}
                                        </p>
                                    </div>
                                </div>

                                {googleTokenStatus.needsRefresh && (
                                    <div className="flex justify-center">
                                        <button
                                            onClick={handleRefreshToken}
                                            disabled={isRefreshingToken}
                                            className="px-6 py-3 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
                                        >
                                            {isRefreshingToken
                                                ? 'Đang refresh...'
                                                : 'Refresh Token'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Password Management */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Quản lý Mật khẩu</h2>

                    <div className="space-y-6">
                        {/* Update Password */}
                        <div className="border-b pb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Cập nhật Mật khẩu
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Mật khẩu mới
                                    </label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Nhập mật khẩu mới"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Xác nhận mật khẩu
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Nhập lại mật khẩu mới"
                                    />
                                </div>
                            </div>
                            <div className="mt-4">
                                <button
                                    onClick={handleUpdatePassword}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Cập nhật Mật khẩu
                                </button>
                            </div>
                        </div>

                        {/* Reset Password */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Reset Mật khẩu
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Tạo mật khẩu mới ngẫu nhiên cho user này
                            </p>
                            <button
                                onClick={handleResetPassword}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Reset Mật khẩu
                            </button>
                        </div>
                    </div>
                </div>

                {/* Create New User */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Tạo User Mới</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={newUserForm.email}
                                onChange={(e) =>
                                    setNewUserForm({ ...newUserForm, email: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="user@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tên
                            </label>
                            <input
                                type="text"
                                value={newUserForm.name}
                                onChange={(e) =>
                                    setNewUserForm({ ...newUserForm, name: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Tên đầy đủ"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mật khẩu
                            </label>
                            <input
                                type="password"
                                value={newUserForm.password}
                                onChange={(e) =>
                                    setNewUserForm({ ...newUserForm, password: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Mật khẩu (tùy chọn)"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Vai trò
                            </label>
                            <select
                                value={newUserForm.role}
                                onChange={(e) =>
                                    setNewUserForm({
                                        ...newUserForm,
                                        role: e.target.value as 'admin' | 'user',
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phương thức đăng nhập
                            </label>
                            <select
                                value={newUserForm.loginMethod}
                                onChange={(e) =>
                                    setNewUserForm({
                                        ...newUserForm,
                                        loginMethod: e.target.value as 'email' | 'google' | 'both',
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="email">Email/Password</option>
                                <option value="google">Google OAuth</option>
                                <option value="both">Cả hai</option>
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={handleCreateUser}
                        className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                        Tạo User
                    </button>
                </div>

                {/* Messages */}
                {(passwordError || passwordSuccess) && (
                    <div
                        className={`p-4 rounded-md ${
                            passwordError
                                ? 'bg-red-50 border border-red-200 text-red-800'
                                : 'bg-green-50 border border-green-200 text-green-800'
                        }`}
                    >
                        {passwordError || passwordSuccess}
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserManagementExample;
