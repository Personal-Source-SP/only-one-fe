'use client';

import { CodeDisplay } from '@/components/common';
import {
    CustomCol,
    CustomFlex,
    CustomForm,
    CustomRow,
    CustomSwitch,
    CustomTypography,
} from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { useEffect, useRef, useState } from 'react';
import { checkService, FEATURE_SECTION_CONTAINER_CLASS } from '../../constants';
import { useFeatureModalContext } from '../../context';
import { FormDiffLabel } from './FormDiffLabel';
import { SectionHeader } from './SectionHeader';

export const FeatureAdvancedSection = () => {
    const { form, isViewingHistory, currentService } = useFeatureModalContext();
    const { hasBrowserSettings, hasAdvancedHeaders } = checkService(currentService);

    const headers = CustomForm.useWatch('headers', form);
    const cookies = CustomForm.useWatch('cookies', form);

    const [hasCustomHeaders, setHasCustomHeaders] = useState<boolean>(Boolean(headers?.trim()));
    const [hasCustomCookies, setHasCustomCookies] = useState<boolean>(Boolean(cookies?.trim()));

    const cachedHeadersRef = useRef<string>(headers || '');
    const cachedCookiesRef = useRef<string>(cookies || '');

    useEffect(() => {
        if (headers && headers.trim()) {
            setHasCustomHeaders(true);
            cachedHeadersRef.current = headers;
        } else if (!headers) {
            setHasCustomHeaders(false);
        }
    }, [headers]);

    useEffect(() => {
        if (cookies && cookies.trim()) {
            setHasCustomCookies(true);
            cachedCookiesRef.current = cookies;
        } else if (!cookies) {
            setHasCustomCookies(false);
        }
    }, [cookies]);

    const handleToggleHeaders = (checked: boolean) => {
        setHasCustomHeaders(checked);
        if (checked) {
            const restored = cachedHeadersRef.current || '{\n  \n}';
            form.setFieldValue('headers', restored);
        } else {
            if (headers) {
                cachedHeadersRef.current = headers;
            }
            form.setFieldValue('headers', undefined);
        }
    };

    const handleToggleCookies = (checked: boolean) => {
        setHasCustomCookies(checked);
        if (checked) {
            const restored = cachedCookiesRef.current || '[\n  \n]';
            form.setFieldValue('cookies', restored);
        } else {
            if (cookies) {
                cachedCookiesRef.current = cookies;
            }
            form.setFieldValue('cookies', undefined);
        }
    };

    if (!hasBrowserSettings && !hasAdvancedHeaders) return null;

    return (
        <CustomFlex vertical className={FEATURE_SECTION_CONTAINER_CLASS}>
            <SectionHeader
                icon="lucide:shield-check"
                title="Mạng & Trình duyệt Nâng cao"
                description="Tùy chọn mô phỏng trình duyệt, vượt bảo vệ chống bot và Headers/Cookies"
            />

            {/* Browser Feature Switches */}
            {hasBrowserSettings && (
                <CustomRow gutter={[12, 12]} className="mb-3">
                    <CustomCol xs={24} sm={12} lg={8}>
                        <CustomFlex
                            gap="small"
                            align="flex-start"
                            justify="space-between"
                            className="p-3.5 rounded-lg bg-hub-card border border-hub-border/50 h-full"
                        >
                            <CustomFlex vertical gap={2} className="min-w-0 flex-1 pr-2">
                                <CustomTypography.Text className="text-sm text-hub-title font-medium">
                                    <FormDiffLabel
                                        label="Lấy phần tử cha"
                                        fieldKey="isGetParentElement"
                                    />
                                </CustomTypography.Text>
                                <CustomTypography.Text className="text-xs text-hub-subtitle leading-snug">
                                    Trích xuất toàn bộ container bao ngoài của selector
                                </CustomTypography.Text>
                            </CustomFlex>
                            <CustomForm.Item
                                name="isGetParentElement"
                                valuePropName="checked"
                                noStyle
                            >
                                <CustomSwitch className="mt-0.5" />
                            </CustomForm.Item>
                        </CustomFlex>
                    </CustomCol>

                    <CustomCol xs={24} sm={12} lg={8}>
                        <CustomFlex
                            gap="small"
                            align="flex-start"
                            justify="space-between"
                            className="p-3.5 rounded-lg bg-hub-card border border-hub-border/50 h-full"
                        >
                            <CustomFlex vertical gap={2} className="min-w-0 flex-1 pr-2">
                                <CustomTypography.Text className="text-sm text-hub-title font-medium">
                                    <FormDiffLabel label="Stealth Mode" fieldKey="stealthMode" />
                                </CustomTypography.Text>
                                <CustomTypography.Text className="text-xs text-hub-subtitle leading-snug">
                                    Ẩn dấu vết tự động hóa để tránh bị trang web chặn
                                </CustomTypography.Text>
                            </CustomFlex>
                            <CustomForm.Item name="stealthMode" valuePropName="checked" noStyle>
                                <CustomSwitch className="mt-0.5" />
                            </CustomForm.Item>
                        </CustomFlex>
                    </CustomCol>

                    <CustomCol xs={24} sm={12} lg={8}>
                        <CustomFlex
                            gap="small"
                            align="flex-start"
                            justify="space-between"
                            className="p-3.5 rounded-lg bg-hub-card border border-hub-border/50 h-full"
                        >
                            <CustomFlex vertical gap={2} className="min-w-0 flex-1 pr-2">
                                <CustomTypography.Text className="text-sm text-hub-title font-medium">
                                    <FormDiffLabel
                                        label="Vượt Cloudflare"
                                        fieldKey="cloudflareBypass"
                                    />
                                </CustomTypography.Text>
                                <CustomTypography.Text className="text-xs text-hub-subtitle leading-snug">
                                    Tự động giải thử thách Turnstile / Cloudflare challenge
                                </CustomTypography.Text>
                            </CustomFlex>
                            <CustomForm.Item
                                name="cloudflareBypass"
                                valuePropName="checked"
                                noStyle
                            >
                                <CustomSwitch className="mt-0.5" />
                            </CustomForm.Item>
                        </CustomFlex>
                    </CustomCol>

                    <CustomCol xs={24} sm={12} lg={8}>
                        <CustomFlex
                            gap="small"
                            align="flex-start"
                            justify="space-between"
                            className="p-3.5 rounded-lg bg-hub-card border border-hub-border/50 h-full"
                        >
                            <CustomFlex vertical gap={2} className="min-w-0 flex-1 pr-2">
                                <CustomTypography.Text className="text-sm text-hub-title font-medium">
                                    <FormDiffLabel
                                        label="Bật JavaScript"
                                        fieldKey="javascriptEnabled"
                                    />
                                </CustomTypography.Text>
                                <CustomTypography.Text className="text-xs text-hub-subtitle leading-snug">
                                    Thực thi JavaScript để render nội dung web động
                                </CustomTypography.Text>
                            </CustomFlex>
                            <CustomForm.Item
                                name="javascriptEnabled"
                                valuePropName="checked"
                                noStyle
                            >
                                <CustomSwitch className="mt-0.5" />
                            </CustomForm.Item>
                        </CustomFlex>
                    </CustomCol>

                    <CustomCol xs={24} sm={12} lg={8}>
                        <CustomFlex
                            gap="small"
                            align="flex-start"
                            justify="space-between"
                            className="p-3.5 rounded-lg bg-hub-card border border-hub-border/50 h-full"
                        >
                            <CustomFlex vertical gap={2} className="min-w-0 flex-1 pr-2">
                                <CustomTypography.Text className="text-sm text-hub-title font-medium">
                                    <FormDiffLabel label="Tải hình ảnh" fieldKey="imagesEnabled" />
                                </CustomTypography.Text>
                                <CustomTypography.Text className="text-xs text-hub-subtitle leading-snug">
                                    Tải tài nguyên hình ảnh (tắt để tăng tốc crawl)
                                </CustomTypography.Text>
                            </CustomFlex>
                            <CustomForm.Item name="imagesEnabled" valuePropName="checked" noStyle>
                                <CustomSwitch className="mt-0.5" />
                            </CustomForm.Item>
                        </CustomFlex>
                    </CustomCol>

                    <CustomCol xs={24} sm={12} lg={8}>
                        <CustomFlex
                            gap="small"
                            align="flex-start"
                            justify="space-between"
                            className="p-3.5 rounded-lg bg-hub-card border border-hub-border/50 h-full"
                        >
                            <CustomFlex vertical gap={2} className="min-w-0 flex-1 pr-2">
                                <CustomTypography.Text className="text-sm text-hub-title font-medium">
                                    <FormDiffLabel label="Tải CSS" fieldKey="cssEnabled" />
                                </CustomTypography.Text>
                                <CustomTypography.Text className="text-xs text-hub-subtitle leading-snug">
                                    Tải định dạng CSS styles (tắt để tiết kiệm băng thông)
                                </CustomTypography.Text>
                            </CustomFlex>
                            <CustomForm.Item name="cssEnabled" valuePropName="checked" noStyle>
                                <CustomSwitch className="mt-0.5" />
                            </CustomForm.Item>
                        </CustomFlex>
                    </CustomCol>
                </CustomRow>
            )}

            {/* Custom Headers & Cookies JSON Inputs */}
            {hasAdvancedHeaders && (
                <CustomRow gutter={[16, 16]}>
                    <CustomCol span={24}>
                        <CustomFlex
                            vertical
                            gap={12}
                            className="p-3.5 rounded-lg bg-hub-card border border-hub-border/50"
                        >
                            <CustomFlex align="center" justify="space-between" className="w-full">
                                <CustomFlex align="center" gap="small">
                                    <Icon
                                        icon="lucide:code-2"
                                        className="text-base text-hub-primary"
                                    />
                                    <CustomFlex vertical gap={2}>
                                        <CustomTypography.Text className="text-sm text-hub-title font-medium">
                                            <FormDiffLabel
                                                fieldKey="headers"
                                                label="Tùy chỉnh Headers (JSON)"
                                            />
                                        </CustomTypography.Text>
                                        <CustomTypography.Text className="text-xs text-hub-subtitle">
                                            Định cấu hình custom headers gửi kèm request HTTP
                                        </CustomTypography.Text>
                                    </CustomFlex>
                                </CustomFlex>
                                <CustomSwitch
                                    checked={hasCustomHeaders}
                                    onChange={handleToggleHeaders}
                                    disabled={isViewingHistory}
                                />
                            </CustomFlex>

                            {hasCustomHeaders ? (
                                <CustomForm.Item name="headers" className="!mb-0">
                                    <CodeDisplay
                                        language="json"
                                        isDisplayLanguage
                                        maxHeight="160px"
                                        code={headers || ''}
                                        onCodeChange={(newCode: string): void => {
                                            cachedHeadersRef.current = newCode;
                                            form.setFieldValue('headers', newCode);
                                        }}
                                    />
                                </CustomForm.Item>
                            ) : (
                                <CustomTypography.Text className="text-xs text-hub-subtitle italic">
                                    Chưa kích hoạt tùy chỉnh HTTP Headers
                                </CustomTypography.Text>
                            )}
                        </CustomFlex>
                    </CustomCol>

                    <CustomCol span={24}>
                        <CustomFlex
                            vertical
                            gap={12}
                            className="p-3.5 rounded-lg bg-hub-card border border-hub-border/50"
                        >
                            <CustomFlex align="center" justify="space-between" className="w-full">
                                <CustomFlex align="center" gap="small">
                                    <Icon
                                        icon="lucide:cookie"
                                        className="text-base text-hub-primary"
                                    />
                                    <CustomFlex vertical gap={2}>
                                        <CustomTypography.Text className="text-sm text-hub-title font-medium">
                                            <FormDiffLabel
                                                fieldKey="cookies"
                                                label="Tùy chỉnh Cookies (JSON Array)"
                                            />
                                        </CustomTypography.Text>
                                        <CustomTypography.Text className="text-xs text-hub-subtitle">
                                            Đính kèm danh sách cookies cho session trình duyệt
                                        </CustomTypography.Text>
                                    </CustomFlex>
                                </CustomFlex>
                                <CustomSwitch
                                    checked={hasCustomCookies}
                                    onChange={handleToggleCookies}
                                    disabled={isViewingHistory}
                                />
                            </CustomFlex>

                            {hasCustomCookies ? (
                                <CustomForm.Item name="cookies" className="!mb-0">
                                    <CodeDisplay
                                        language="json"
                                        isDisplayLanguage
                                        maxHeight="160px"
                                        code={cookies || ''}
                                        onCodeChange={(newCode: string): void => {
                                            cachedCookiesRef.current = newCode;
                                            form.setFieldValue('cookies', newCode);
                                        }}
                                    />
                                </CustomForm.Item>
                            ) : (
                                <CustomTypography.Text className="text-xs text-hub-subtitle italic">
                                    Chưa kích hoạt tùy chỉnh Cookies
                                </CustomTypography.Text>
                            )}
                        </CustomFlex>
                    </CustomCol>
                </CustomRow>
            )}
        </CustomFlex>
    );
};
