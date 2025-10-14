'use client';

import { CustomModal } from '@/components/common';
import { SortOrder } from '@/enums';
import { NBaseApi, NGoogle } from '@/interfaces';
import { exchangeCodeForTokens, getGoogleAuthUrl, isExpiredToken } from '@/libs';
import { Icon } from '@iconify/react';
import { useApiUrl, useCustomMutation } from '@refinedev/core';
import { Button, Flex, message, Select, Space, Tabs } from 'antd';
import { useSearchParams } from 'next/navigation';
import { FC, memo, useEffect, useState } from 'react';

export type SyncFileGoogleDriveProps = {
    isOpen: boolean;
    onClose: (isOpen: boolean) => void;
    isLoadingGoogleAuth?: boolean;
    googleAuth?: NGoogle.IGoogleAuth;
};

const SyncFileGoogleDrive: FC<SyncFileGoogleDriveProps> = ({
    isOpen,
    onClose,
    googleAuth,
    isLoadingGoogleAuth,
}) => {
    const apiUrl = useApiUrl();
    const searchParams = useSearchParams();

    const { mutate: syncGoogleAuth } = useCustomMutation<NBaseApi.IResponse<boolean>>();
    const { mutate: syncGoogleDrive } = useCustomMutation<NBaseApi.IResponse<boolean>>();

    const [loading, setLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const googleToken = googleAuth?.googleAccessToken;
        const googleExpiresAt = googleAuth?.googleExpiresAt;

        if (googleToken && googleExpiresAt) {
            const expiryDate = new Date(googleExpiresAt as unknown as string);
            const isExpired = isExpiredToken(expiryDate);
            setIsAuthenticated(!isExpired);
        } else {
            setIsAuthenticated(false);
        }
    }, [googleAuth]);

    useEffect(() => {
        if (!searchParams) return;

        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
            message.error('Kết nối Google thất bại');
            return;
        }

        if (code) {
            getGoogleAuthTokens(code as string);
        }
    }, [searchParams]);

    const handleGoogleAuth = async () => {
        setLoading(true);

        try {
            const url = getGoogleAuthUrl();

            if (!url) {
                message.error('Lỗi khi tạo URL kết nối Google');
                return;
            }

            window.location.href = url;
        } catch (e) {
            message.error('Lỗi khi tạo URL kết nối Google');
        } finally {
            setLoading(false);
        }
    };

    const getGoogleAuthTokens = async (code: string) => {
        setLoading(true);

        try {
            const tokens = await exchangeCodeForTokens(
                code,
                process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI as string,
            );

            if (!tokens) {
                message.error('Lỗi khi lấy token Google');
                return;
            }

            syncGoogleAuth({
                method: 'put',
                url: `${apiUrl}/google-auth`,
                values: {
                    accessToken: tokens.access_token,
                    expiresIn: tokens.expires_in,
                    scope: tokens.scope,
                    tokenType: tokens.token_type,
                    refreshToken: tokens.refresh_token,
                    refreshTokenExpiresIn: tokens.refresh_token_expires_in,
                },
                successNotification: (data) => {
                    if (!data?.data?.data) {
                        return {
                            type: 'error',
                            message: 'Kết nối Google thất bại',
                        };
                    }

                    return {
                        type: 'success',
                        message: 'Kết nối Google thành công',
                    };
                },
                errorNotification: () => {
                    return {
                        type: 'error',
                        message: 'Kết nối Google thất bại',
                    };
                },
            });
        } catch (e) {
            message.error('Lỗi khi kết nối Google');
        } finally {
            setLoading(false);
        }
    };

    const handleSyncGoogleDriveFolders = async () => {
        setLoading(true);

        try {
            syncGoogleDrive({
                method: 'post',
                url: `${apiUrl}/google-drive/sync/folders`,
                values: {},
                successNotification: (data) => {
                    if (!data?.data?.data) {
                        return {
                            type: 'error',
                            message: 'Đồng bộ Google Drive thất bại',
                        };
                    }

                    return {
                        type: 'success',
                        message: 'Đồng bộ Google Drive thành công',
                    };
                },
                errorNotification: () => {
                    return {
                        type: 'error',
                        message: 'Đồng bộ Google Drive thất bại',
                    };
                },
            });
        } catch (e) {
            message.error('Lỗi khi đồng bộ Google Drive');
        } finally {
            setLoading(false);
        }
    };

    const renderFooter = () => {
        if (!isAuthenticated) {
            return (
                <Flex justify="space-between" align="center" gap={16}>
                    <Button
                        className="w-full"
                        loading={loading}
                        onClick={() => onClose(false)}
                        icon={<Icon icon="lucide:x" />}
                    >
                        <span>Đóng</span>
                    </Button>
                    <Button
                        type="primary"
                        loading={loading}
                        className="w-full"
                        onClick={handleGoogleAuth}
                        icon={<Icon icon="lucide:google" />}
                    >
                        Kết nối Google
                    </Button>
                </Flex>
            );
        }

        return (
            <Flex justify="space-between" align="center" gap={16}>
                <Button
                    className="w-full"
                    loading={loading}
                    icon={<Icon icon="lucide:x" />}
                    onClick={() => onClose(false)}
                >
                    <span>Đóng</span>
                </Button>
                <Button
                    type="primary"
                    className="w-full"
                    loading={loading}
                    icon={<Icon icon="lucide:sync" />}
                    onClick={handleSyncGoogleDriveFolders}
                >
                    <span>Đồng bộ</span>
                </Button>
            </Flex>
        );
    };

    const renderSyncFile = () => {
        return (
            <Space direction="vertical" size="middle" className="!w-full h-full">
                {/* <Select
                                        placeholder="Thư mục"
                                        value={pendingFolder}
                                        options={folderOptions}
                                        onChange={(val) => setPendingFolder(val as string | undefined)}
                                    /> */}
                {isAuthenticated ? (
                    <Select
                        placeholder="Sắp xếp"
                        // onChange={(val) => setPendingSort(val as SortOrder)}
                        options={[
                            {
                                value: SortOrder.NEWEST,
                                label: 'Mới nhất trước',
                            },
                            { value: SortOrder.OLDEST, label: 'Cũ nhất trước' },
                        ]}
                    />
                ) : null}
            </Space>
        );
    };

    const renderSyncFolder = () => {
        return (
            <Space direction="vertical" size="middle" className="!w-full h-full">
                <p>Chức năng đồng bộ thư mục sẽ sớm được hỗ trợ.</p>
            </Space>
        );
    };

    return (
        <CustomModal
            modalProps={{
                width: 720,
                open: isOpen,
                centered: true,
                title: 'Đồng bộ file',
                footer: renderFooter(),
                loading: isLoadingGoogleAuth,
            }}
        >
            <Space direction="vertical" size="middle" className="!w-full h-full">
                {isAuthenticated && (
                    <Tabs
                        type="card"
                        defaultActiveKey="file"
                        items={[
                            {
                                key: 'file',
                                label: 'Đồng bộ file',
                                children: renderSyncFile(),
                            },
                            {
                                key: 'folder',
                                label: 'Đồng bộ thư mục',
                                children: renderSyncFolder(),
                            },
                        ]}
                    />
                )}
            </Space>
        </CustomModal>
    );
};

export default memo(SyncFileGoogleDrive);
