'use client';

import { useState, type FC, type JSX } from 'react';
import {
    CustomButton,
    CustomFlex,
    CustomForm,
    CustomModal,
    CustomSelect,
} from '@/components/custom-antd';
import { DataProviderFeatureType, MessageType } from '@/enums';
import { useCustomMutationData } from '@/hooks';
import { Icon } from '@iconify/react';

interface CreateFeatureModalProps {
    open: boolean;
    dataProviderId: string;
    availableTypes: DataProviderFeatureType[];
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateFeatureModal: FC<CreateFeatureModalProps> = ({
    open,
    dataProviderId,
    availableTypes,
    onClose,
    onSuccess,
}): JSX.Element => {
    const [form] = CustomForm.useForm();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { handleCustomMutationData } = useCustomMutationData();

    const handleCreate = async (): Promise<void> => {
        try {
            const values = await form.validateFields();
            setIsLoading(true);

            handleCustomMutationData({
                method: 'post',
                url: `data-provider-features/data-providers/${dataProviderId}`,
                values: {
                    type: values.type,
                    service: values.service || 'generic',
                    config: {},
                },
                successNotification: () => {
                    setIsLoading(false);
                    onSuccess();
                    onClose();
                    return {
                        type: MessageType.SUCCESS,
                        message: 'Khởi tạo tính năng thành công',
                    };
                },
                errorNotification: (error) => {
                    setIsLoading(false);
                    return {
                        type: MessageType.ERROR,
                        message: 'Khởi tạo tính năng thất bại',
                        description: error?.message,
                    };
                },
            });
        } catch (error) {
            setIsLoading(false);
            console.error('Create feature error:', error);
        }
    };

    const typeOptions = availableTypes.map((type) => ({
        label:
            type === DataProviderFeatureType.SCRAPING
                ? 'Cào dữ liệu (Scraping)'
                : 'Tìm kiếm (Search)',
        value: type,
    }));

    const serviceOptions = [
        { label: 'Generic (HTML / Axios / Cheerio)', value: 'generic' },
        { label: 'Puppeteer Headless', value: 'puppeteer' },
        { label: 'Playwright', value: 'playwright' },
    ];

    return (
        <CustomModal
            open={open}
            onCancel={onClose}
            title={
                <div className="flex items-center gap-2 text-base font-semibold">
                    <Icon icon="lucide:plus-circle" className="text-hub-primary text-xl" />
                    <span>Khởi tạo tính năng mới</span>
                </div>
            }
            footer={
                <CustomFlex justify="end" gap={8}>
                    <CustomButton onClick={onClose} disabled={isLoading}>
                        Hủy
                    </CustomButton>
                    <CustomButton
                        type="primary"
                        loading={isLoading}
                        onClick={handleCreate}
                        icon={<Icon icon="lucide:check" />}
                    >
                        Tạo tính năng
                    </CustomButton>
                </CustomFlex>
            }
        >
            <CustomForm
                form={form}
                layout="vertical"
                initialValues={{
                    type: availableTypes[0] || DataProviderFeatureType.SCRAPING,
                    service: 'generic',
                }}
            >
                <CustomForm.Item
                    name="type"
                    label="Loại tính năng"
                    rules={[{ required: true, message: 'Vui lòng chọn loại tính năng' }]}
                >
                    <CustomSelect options={typeOptions} placeholder="Chọn loại tính năng" />
                </CustomForm.Item>

                <CustomForm.Item
                    name="service"
                    label="Service Engine"
                    rules={[{ required: true, message: 'Vui lòng chọn engine' }]}
                >
                    <CustomSelect options={serviceOptions} placeholder="Chọn engine" />
                </CustomForm.Item>
            </CustomForm>
        </CustomModal>
    );
};
