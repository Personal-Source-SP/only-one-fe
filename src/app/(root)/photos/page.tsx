'use client';

import { ElementType, GoogleDriveFileType, SortOrder, ViewMode } from '@/enums';
import type { NBaseApi, NGoogle } from '@/interfaces';
import { Icon } from '@iconify/react';
import { useTable } from '@refinedev/antd';
import { HttpError, useApiUrl, useCustom, useCustomMutation, useSelect } from '@refinedev/core';
import { Button, Col, Flex, Input, message, Row, Select, Space } from 'antd';
import { isNumber } from 'lodash';
import { FC, useEffect, useMemo, useRef, useState } from 'react';

import Lightbox from 'yet-another-react-lightbox';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';

import { CustomElement, PaginationControls } from '@/components/common';

import PhotoGroups from '@/components/module/photos/PhotoGroups';
import SyncFileGoogleDrive from '@/components/module/photos/SyncGoogleDrive';
import { useMainContext } from '@/contexts/MainContext';
import { useDebounceSearch } from '@/hooks/useDebounceSearch';
import { exchangeCodeForTokens, getUserInfoFromGoogle, isExpiredToken } from '@/libs/googleapis';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const PhotosPage: FC = () => {
    const apiUrl = useApiUrl();
    const router = useRouter();
    const pathname = usePathname();
    const handledAuthRef = useRef(false);
    const searchParams = useSearchParams();

    const { handleLoading } = useMainContext();

    const [columns, setColumns] = useState(4);
    const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.ALL);

    const [isOpenSyncFile, setIsOpenSyncFile] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
    const [slideshowInterval, setSlideshowInterval] = useState<number>(5);

    const { currentPage, setCurrentPage, pageSize, setPageSize, setFilters, tableQuery } = useTable<
        NGoogle.IGoogleDriveFile,
        HttpError,
        Partial<NGoogle.IGoogleDriveFile>
    >({
        resource: 'google-drive/files',
        syncWithLocation: false,
        pagination: {
            pageSize: 10,
            mode: 'server',
        },
        sorters: {
            mode: 'server',
            initial: [{ field: 'createdAt', order: 'desc' }],
        },
        filters: {
            initial: [
                { field: 'mimeType', operator: 'contains', value: GoogleDriveFileType.IMAGE },
            ],
        },
    });

    const { result: googleAuthsResult, query: queryGoogleAuths } = useCustom<
        NBaseApi.IResponse<NGoogle.IGoogleAuth[]>
    >({
        url: `${apiUrl}/google-auth`,
        method: 'get',
        queryOptions: {
            enabled: false,
        },
    });

    const { options: folderOptions, query: queryFolderOptions } =
        useSelect<NGoogle.IGoogleDriveFolder>({
            resource: 'google-drive/folders/all',
            optionValue: (item: NGoogle.IGoogleDriveFolder) => item.id,
            optionLabel: (item: NGoogle.IGoogleDriveFolder) => item.name,
            queryOptions: {
                enabled: false,
            },
        });

    const { mutate: syncGoogleAuth } = useCustomMutation<NBaseApi.IResponse<boolean>>();

    const googleDriveFiles = useMemo(() => {
        return tableQuery?.data?.data ?? [];
    }, [tableQuery?.data?.data]);

    const googleAuthOptions = useMemo(() => {
        if (!googleAuthsResult?.data?.data?.length) return [];

        const options = googleAuthsResult?.data?.data?.map((item) => ({
            value: item.id,
            label: item.email,
        }));

        return options;
    }, [googleAuthsResult?.data?.data]);

    const googleAuthNotExpired = useMemo(() => {
        if (!googleAuthsResult?.data?.data?.length) return [];

        return googleAuthsResult?.data?.data?.filter(
            (item) => !isExpiredToken(item.googleExpiresAt),
        );
    }, [googleAuthsResult?.data?.data]);

    useEffect(() => {
        queryGoogleAuths?.refetch();
        queryFolderOptions?.refetch();
    }, []);

    useEffect(() => {
        const updateColumns = () => {
            const width = window.innerWidth;
            if (width < 640) {
                setColumns(2);
            } else if (width < 1024) {
                setColumns(3);
            } else {
                setColumns(4);
            }
        };

        window.addEventListener('resize', updateColumns);

        updateColumns();
    }, []);

    useEffect(() => {
        const code = searchParams?.get('code');
        const error = searchParams?.get('error');

        if (!code && !error) return;
        if (handledAuthRef.current) return;

        handledAuthRef.current = true;

        if (error) {
            message.error('Kết nối Google thất bại');
            router.replace(pathname);
            return;
        }

        if (code) {
            Promise.resolve(handleSaveToken(code as string)).finally(() => {
                router.replace(pathname);
            });
        }
    }, [searchParams?.toString(), pathname, router]);

    const debouncedSearch = useDebounceSearch({
        setFilters,
        setCurrentPage,
        fieldName: 'name',
    });

    const handleSaveToken = async (code: string) => {
        handleLoading(true);

        try {
            const tokens = await exchangeCodeForTokens(
                code,
                process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI as string,
            );

            if (!tokens) {
                message.error('Lỗi khi lấy token Google');
                return;
            }

            const userInfo = await getUserInfoFromGoogle(tokens.access_token);
            if (!userInfo) {
                message.error('Lỗi khi lấy thông tin người dùng Google');
                return;
            }

            syncGoogleAuth({
                method: 'put',
                url: `${apiUrl}/google-auth`,
                values: {
                    email: userInfo.email,
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

                    window.location.href = '/photos';

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
            handleLoading(false);
        }
    };

    const startSlideshow = () => {
        setIsLightboxOpen(true);
    };

    const stopSlideshow = () => {
        setIsLightboxOpen(false);
    };

    const openLightbox = (index: number) => {
        setCurrentPage(index);
        setIsLightboxOpen(true);
    };

    const closeLightbox = () => {
        setIsLightboxOpen(false);
    };

    const handlePhotoClick = (url: string) => {
        const index = googleDriveFiles?.findIndex((photo) => photo.webContentLink === url);
        if (isNumber(index)) {
            openLightbox(index ?? 0);
        }
    };

    const renderSectionFilters = () => {
        return (
            <Row gutter={[16, 8]} className="py-3">
                <Col span={18}>
                    <Input
                        placeholder="Tìm kiếm ảnh của bạn..."
                        onChange={(e) => debouncedSearch(e.target.value.trim())}
                        prefix={<Icon icon="lucide:search" className="text-foreground-500" />}
                    />
                </Col>
                <Col span={2}>
                    <Select
                        value={columns}
                        placeholder="Số cột"
                        onChange={(value) => setColumns(value)}
                        options={[1, 2, 3, 4, 8].map((item) => ({
                            value: item,
                            label: item,
                        }))}
                    />
                </Col>
                <Col span={4}>
                    <Select
                        value={viewMode}
                        placeholder="Chế độ xem"
                        onChange={(value) => setViewMode(value)}
                        options={[
                            { value: ViewMode.ALL, label: 'Xem tất cả' },
                            { value: ViewMode.DATE, label: 'Xem theo ngày' },
                            { value: ViewMode.FOLDER, label: 'Xem theo thư mục' },
                        ]}
                    />
                </Col>
                <Col span={12}>
                    <Select
                        allowClear
                        showSearch
                        mode="multiple"
                        placeholder="Thư mục"
                        options={folderOptions}
                        onChange={(value) => {
                            setFilters([{ field: 'folderId', operator: 'eq', value }]);
                            setCurrentPage(1);
                        }}
                    />
                </Col>
                <Col span={12}>
                    <Select
                        allowClear
                        showSearch
                        mode="multiple"
                        placeholder="Email"
                        options={googleAuthOptions}
                        onChange={(value) => {
                            setFilters([{ field: 'googleAuthId', operator: 'eq', value }]);
                            setCurrentPage(1);
                        }}
                    />
                </Col>
            </Row>
        );
    };

    console.log(googleAuthsResult?.data?.data);

    return (
        <Space size="middle" direction="vertical" className="w-full h-full">
            <CustomElement
                title="Photos"
                elementType={ElementType.TITLE}
                actions={[
                    <Button
                        key="slideshow"
                        type="primary"
                        onClick={startSlideshow}
                        icon={<Icon icon="lucide:play" />}
                    >
                        Trình chiếu
                    </Button>,
                    <Button
                        key="sync"
                        type="primary"
                        icon={<Icon icon="mdi:sync" />}
                        onClick={() => setIsOpenSyncFile(true)}
                    >
                        Đồng bộ hoá
                    </Button>,
                ]}
            />

            <CustomElement elementType={ElementType.CONTAINER} loading={tableQuery?.isLoading}>
                <CustomElement
                    elementType={ElementType.CARD}
                    header={renderSectionFilters()}
                    actions={[
                        <PaginationControls
                            itemsPerPage={pageSize}
                            currentPage={currentPage}
                            totalItems={googleDriveFiles?.length}
                            onPageChange={(page) => setCurrentPage(page)}
                            onItemsPerPageChange={(pageSize) => {
                                setCurrentPage(1);
                                setPageSize(pageSize);
                            }}
                        />,
                    ]}
                >
                    <PhotoGroups
                        columns={columns}
                        displayMode={viewMode}
                        onPhotoClick={handlePhotoClick}
                        googleDriveFiles={googleDriveFiles}
                    />
                </CustomElement>
            </CustomElement>

            <Lightbox
                index={currentPage}
                open={isLightboxOpen}
                slideshow={{ delay: slideshowInterval * 1000 }}
                plugins={[Fullscreen, Slideshow, Thumbnails, Zoom]}
                // slides={(googleDriveFiles || [])?.map((p) => ({
                //     src: p.webContentLink || p.thumbnailLink || '',
                // }))}
                close={() => {
                    closeLightbox();
                    stopSlideshow();
                }}
            />

            {isOpenSyncFile && (
                <SyncFileGoogleDrive
                    folderOptions={folderOptions || []}
                    onSuccess={() => tableQuery?.refetch()}
                    onClose={() => setIsOpenSyncFile(false)}
                    googleAuths={googleAuthNotExpired ?? []}
                    queryLoading={queryGoogleAuths?.isLoading || queryFolderOptions?.isLoading}
                />
            )}
        </Space>
    );
};

export default PhotosPage;
