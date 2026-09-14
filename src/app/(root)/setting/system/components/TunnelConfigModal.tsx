'use client';

import { FC, useEffect } from 'react';
import {
    CustomButton,
    CustomForm,
    CustomInput,
    CustomModal,
    CustomRadio,
} from '@/components/custom-antd';
import type { TunnelConfigDto } from '../types';

interface TunnelConfigModalProps {
    open: boolean;
    initialValues: TunnelConfigDto;
    onCancel: () => void;
    onSave: (values: TunnelConfigDto) => void;
}

export const TunnelConfigModal: FC<TunnelConfigModalProps> = ({
    open,
    initialValues,
    onCancel,
    onSave,
}) => {
    const [form] = CustomForm.useForm<TunnelConfigDto>();
    const modeValue = CustomForm.useWatch('mode', form);

    useEffect(() => {
        if (open) {
            form.setFieldsValue(initialValues);
        }
    }, [open, initialValues, form]);

    const handleOk = async () => {
        const values = await form.validateFields();
        onSave(values);
    };

    return (
        <CustomModal
            open={open}
            title="⚙️ Cấu hình Cloudflare Tunnel"
            onCancel={onCancel}
            footer={[
                <CustomButton key="cancel" onClick={onCancel}>
                    Hủy
                </CustomButton>,
                <CustomButton key="submit" type="primary" onClick={handleOk}>
                    Lưu cấu hình
                </CustomButton>,
            ]}
        >
            <CustomForm form={form} layout="vertical" initialValues={initialValues}>
                <CustomForm.Item name="mode" label="Chế độ Tunnel" rules={[{ required: true }]}>
                    <CustomRadio.Group className="flex flex-col gap-2">
                        <CustomRadio value="quick">
                            <div>
                                <span className="font-semibold text-hub-title">
                                    Quick Tunnel (Tự động / Miễn phí)
                                </span>
                                <div className="text-xs text-hub-muted">
                                    Zero-config, tự sinh URL ngẫu nhiên (*.trycloudflare.com).
                                </div>
                            </div>
                        </CustomRadio>
                        <CustomRadio value="named">
                            <div>
                                <span className="font-semibold text-hub-title">
                                    Fixed Named Tunnel (Domain cố định)
                                </span>
                                <div className="text-xs text-hub-muted">
                                    Cố định URL vĩnh viễn thông qua Cloudflare Tunnel Token.
                                </div>
                            </div>
                        </CustomRadio>
                    </CustomRadio.Group>
                </CustomForm.Item>

                {modeValue === 'named' && (
                    <>
                        <CustomForm.Item
                            name="token"
                            label="Cloudflare Tunnel Token"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập Tunnel Token',
                                },
                            ]}
                            extra="Lấy từ Cloudflare Zero Trust Dashboard -> Access -> Tunnels"
                        >
                            <CustomInput.Password placeholder="eyJhIjoi..." />
                        </CustomForm.Item>

                        <CustomForm.Item
                            name="customUrl"
                            label="Custom Public URL"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập Public URL',
                                },
                            ]}
                            extra="Ví dụ: https://app.yourdomain.com"
                        >
                            <CustomInput placeholder="https://app.yourdomain.com" />
                        </CustomForm.Item>
                    </>
                )}
            </CustomForm>
        </CustomModal>
    );
};
