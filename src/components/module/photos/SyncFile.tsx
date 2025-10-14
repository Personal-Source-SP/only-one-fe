'use client';

import { CustomModal } from '@/components/common';
import { SortOrder } from '@/enums';
import { NBaseApi, NGoogle } from '@/interfaces';
import { exchangeCodeForTokens, getGoogleAuthUrl, isExpiredToken } from '@/libs';
import { Icon } from '@iconify/react';
import { useApiUrl, useCustom, useCustomMutation } from '@refinedev/core';
import { Button, Flex, message, Select, Space } from 'antd';
import { useSearchParams } from 'next/navigation';
import { FC, memo, useEffect, useState } from 'react';

export type SyncFileProps = {
    isOpen: boolean;
    onClose: (isOpen: boolean) => void;
};

const SyncFile: FC<SyncFileProps> = ({ isOpen, onClose }) => {
    const apiUrl = useApiUrl();
    const searchParams = useSearchParams();

    const { result: googleAuth, query } = useCustom<NBaseApi.IResponse<NGoogle.IGoogleAuth>>({
        url: `${apiUrl}/google-auth`,
        method: 'get',
    });

    const { mutate: syncGoogleAuth } = useCustomMutation<NBaseApi.IResponse<boolean>>();

    const [loading, setLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const googleToken = googleAuth?.data?.data?.googleAccessToken;
        const googleExpiresAt = googleAuth?.data?.data?.googleExpiresAt;

        if (googleToken && googleExpiresAt) {
            const expiryDate = new Date(googleExpiresAt as unknown as string);
            const isExpired = isExpiredToken(expiryDate);
            setIsAuthenticated(!isExpired);
        } else {
            setIsAuthenticated(false);
        }
    }, [googleAuth?.data]);

    useEffect(() => {
        if (!searchParams) return;

        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error || !code) {
            message.error('Kết nối Google thất bại');
            return;
        }

        getGoogleAuthTokens(code as string);
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
                    onClick={() => {
                        // onApplyFilters({
                        //     viewMode: pendingView,
                        //     sortOrder: pendingSort,
                        //     folderId: pendingFolder,
                        // });
                        onClose(false);
                    }}
                >
                    <span>Đồng bộ</span>
                </Button>
            </Flex>
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
                loading: query?.isLoading,
            }}
        >
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
                            { value: SortOrder.NEWEST, label: 'Mới nhất trước' },
                            { value: SortOrder.OLDEST, label: 'Cũ nhất trước' },
                        ]}
                    />
                ) : null}
            </Space>
        </CustomModal>
    );
};

export default memo(SyncFile);
