import React, { useState } from 'react';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

interface UserProfileProps {
    className?: string;
    showPermissions?: boolean;
}

export function UserProfile({ className = '', showPermissions = true }: UserProfileProps) {
    const { user, permissions, logout, loading } = useGoogleAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    if (!user) {
        return null;
    }

    const handleLogout = async () => {
        setIsDropdownOpen(false);
        await logout();
    };

    return (
        <div className={`relative ${className}`}>
            {/* User Avatar and Name */}
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
                <img
                    src={user.picture}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border-2 border-gray-200"
                />
                <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                        isDropdownOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <img
                                src={user.picture}
                                alt={user.name}
                                className="w-12 h-12 rounded-full border-2 border-gray-200"
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
                                        Đã xác thực
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Permissions Section */}
                    {showPermissions && permissions && (
                        <div className="p-4 border-b border-gray-200">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                                Quyền truy cập
                            </h4>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Google Drive</span>
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
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Trạng thái</span>
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
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="p-2">
                        <button
                            onClick={handleLogout}
                            disabled={loading}
                            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></div>
                                    <span>Đang đăng xuất...</span>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                        />
                                    </svg>
                                    <span>Đăng xuất</span>
                                </div>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Backdrop */}
            {isDropdownOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
            )}
        </div>
    );
}
