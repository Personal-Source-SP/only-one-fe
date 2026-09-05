'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    CustomFlex,
    CustomForm,
    CustomInput,
    CustomTypography,
    type FormInstance,
} from '@/components/custom-antd';
import { DEFAULT_SEARCH_FUNCTION_GENERATOR } from '@/constants';
import { MessageType, ScraperServiceEnum } from '@/enums';
import { useCustomMutationData } from '@/hooks';
import { Icon } from '@iconify/react';
import type { IConfigVersion, IDataProviderFeature } from '../../types';
import { SearchCodeSection } from './SearchCodeSection';
import { SearchSelectorsSection } from './SearchSelectorsSection';
import { SearchUrlPatternSection } from './SearchUrlPatternSection';

export type SearchConfigFormProps = {
    feature: IDataProviderFeature;
    form?: FormInstance;
    selectedVersion?: IConfigVersion | null;
    isViewingHistory?: boolean;
    onClose: () => void;
    onSuccess: () => void;
    setIsSaving?: (loading: boolean) => void;
};

export const SearchConfigForm = ({
    feature,
    form: externalForm,
    selectedVersion,
    isViewingHistory,
    onClose,
    onSuccess,
    setIsSaving: externalSetIsSaving,
}: SearchConfigFormProps) => {
    const [internalForm] = CustomForm.useForm();

    const form = externalForm || internalForm;
    const functionGenerator = CustomForm.useWatch('functionGenerator', form);

    const [isSaving, setIsSaving] = useState<boolean>(false);

    const isDraft = useMemo(() => !feature.id, [feature.id]);

    const { handleCustomMutationData } = useCustomMutationData();

    useEffect(() => {
        externalSetIsSaving?.(isSaving);
    }, [isSaving, externalSetIsSaving]);

    useEffect(() => {
        const config = selectedVersion?.config || feature.config || {};
        const service =
            selectedVersion?.config?.service || feature.service || ScraperServiceEnum.GENERIC;

        form.setFieldsValue({
            service,
            changeDescription: '',
            searchUrlPattern: config.searchUrlPattern || '',
            queryPlaceholder: config.queryPlaceholder || '{query}',
            mainContentSelector: config.mainContentSelector || '',
            resultSelector: config.resultSelector || '',
            maxResults: config.maxResults ?? 10,
            isGetParentElement: config.isGetParentElement ?? false,
            functionGenerator: config.functionGenerator || DEFAULT_SEARCH_FUNCTION_GENERATOR,
        });
    }, [feature, selectedVersion, form]);

    const handleSave = useCallback(
        async (values: any): Promise<void> => {
            setIsSaving(true);

            const { service, changeDescription, ...configValues } = values;

            const method = isDraft ? 'post' : 'put';
            const endpoint = isDraft
                ? `data-provider-features/data-providers/${feature.dataProviderId}`
                : `data-provider-features/${feature.id}`;

            const payload: Record<string, any> = {
                config: configValues,
                service: service || ScraperServiceEnum.GENERIC,
            };

            if (!isDraft) {
                payload.changeDescription = changeDescription || 'Cập nhật cấu hình tìm kiếm';
            } else {
                payload.type = feature.type;
            }

            try {
                handleCustomMutationData({
                    method,
                    url: endpoint,
                    values: payload,
                    successNotification: () => {
                        setIsSaving(false);
                        onSuccess();
                        onClose();

                        return {
                            type: MessageType.SUCCESS,
                            message: isDraft
                                ? 'Khởi tạo và lưu cấu hình tìm kiếm thành công'
                                : 'Lưu cấu hình tìm kiếm thành công',
                        };
                    },
                    errorNotification: (error) => {
                        setIsSaving(false);

                        return {
                            type: MessageType.ERROR,
                            description: error?.message,
                            message: isDraft
                                ? 'Khởi tạo cấu hình thất bại'
                                : 'Lưu cấu hình thất bại',
                        };
                    },
                });
            } finally {
                setIsSaving(false);
            }
        },
        [isDraft, feature, handleCustomMutationData, onSuccess, onClose],
    );

    return (
        <CustomForm form={form} layout="vertical" onFinish={handleSave}>
            <CustomFlex vertical gap="middle" className="w-full">
                <SearchUrlPatternSection
                    feature={feature}
                    selectedVersion={selectedVersion}
                    isViewingHistory={isViewingHistory}
                />

                <SearchSelectorsSection
                    feature={feature}
                    selectedVersion={selectedVersion}
                    isViewingHistory={isViewingHistory}
                />

                <SearchCodeSection
                    form={form}
                    functionGenerator={functionGenerator}
                    feature={feature}
                    selectedVersion={selectedVersion}
                    isViewingHistory={isViewingHistory}
                />

                {!isDraft && (
                    <CustomFlex
                        vertical
                        className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4"
                    >
                        <CustomFlex align="center" gap="small" className="mb-2">
                            <Icon icon="lucide:file-text" className="text-hub-primary shrink-0" />
                            <CustomTypography.Text strong className="text-sm text-hub-title">
                                Mô tả thay đổi phiên bản (Change Log)
                            </CustomTypography.Text>
                        </CustomFlex>
                        <CustomForm.Item name="changeDescription" className="!mb-0">
                            <CustomInput placeholder="Ví dụ: Cập nhật URL pattern tìm kiếm mới..." />
                        </CustomForm.Item>
                    </CustomFlex>
                )}
            </CustomFlex>
        </CustomForm>
    );
};
