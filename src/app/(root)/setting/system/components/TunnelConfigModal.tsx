'use client';

import { FC, useCallback, useEffect, useMemo } from 'react';

import {
    CustomButton,
    CustomFlex,
    CustomForm,
    CustomInputForm,
    CustomInputFormType,
    CustomModal,
    CustomRadio,
    CustomTypography,
} from '@/components';
import { FormRuleType } from '@/utilities';

import type { TunnelConfigDto } from '../types';

export type TunnelConfigModalProps = {
    open: boolean;
    initialValues: TunnelConfigDto;
    onCancel: () => void;
    onSave: (values: TunnelConfigDto) => void;
};

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

    const handleOk = useCallback(async () => {
        const values = await form.validateFields();
        onSave(values);
    }, [form, onSave]);

    const modalFooter = useMemo(
        () => [
            <CustomButton key="cancel" onClick={onCancel}>
                Hủy
            </CustomButton>,
            <CustomButton key="submit" type="primary" onClick={handleOk}>
                Lưu cấu hình
            </CustomButton>,
        ],
        [onCancel, handleOk],
    );

    return (
        <CustomModal
            centered
            width={600}
            open={open}
            onCancel={onCancel}
            footer={modalFooter}
            title="⚙️ Cấu hình Cloudflare Tunnel"
        >
            {/* eslint-disable-next-line no-restricted-syntax -- Standalone system RPC setting dialog */}
            <CustomForm form={form} layout="vertical" initialValues={initialValues}>
                <CustomForm.Item name="mode" label="Chế độ Tunnel" rules={[{ required: true }]}>
                    <CustomRadio.Group className="flex flex-col gap-2">
                        <CustomRadio value="quick">
                            <CustomFlex vertical>
                                <CustomTypography.Text strong className="text-hub-title">
                                    Quick Tunnel (Tự động / Miễn phí)
                                </CustomTypography.Text>
                                <CustomTypography.Text className="text-xs text-hub-muted">
                                    Zero-config, tự sinh URL ngẫu nhiên (*.trycloudflare.com).
                                </CustomTypography.Text>
                            </CustomFlex>
                        </CustomRadio>
                        <CustomRadio value="named">
                            <CustomFlex vertical>
                                <CustomTypography.Text strong className="text-hub-title">
                                    Fixed Named Tunnel (Domain cố định)
                                </CustomTypography.Text>
                                <CustomTypography.Text className="text-xs text-hub-muted">
                                    Cố định URL vĩnh viễn thông qua Cloudflare Tunnel Token.
                                </CustomTypography.Text>
                            </CustomFlex>
                        </CustomRadio>
                    </CustomRadio.Group>
                </CustomForm.Item>

                {modeValue === 'named' && (
                    <>
                        <CustomInputForm
                            name="token"
                            label="Cloudflare Tunnel Token"
                            type={CustomInputFormType.Password}
                            formItemProps={{
                                extra: 'Lấy từ Cloudflare Zero Trust Dashboard -> Access -> Tunnels',
                            }}
                            rulesConfig={[
                                {
                                    type: FormRuleType.Required,
                                    message: 'Vui lòng nhập Tunnel Token',
                                },
                            ]}
                            passwordProps={{ placeholder: 'eyJhIjoi...' }}
                        />

                        <CustomInputForm
                            name="customUrl"
                            label="Custom Public URL"
                            formItemProps={{ extra: 'Ví dụ: https://app.yourdomain.com' }}
                            rulesConfig={[
                                {
                                    type: FormRuleType.Required,
                                    message: 'Vui lòng nhập Public URL',
                                },
                            ]}
                            inputProps={{ placeholder: 'https://app.yourdomain.com' }}
                        />
                    </>
                )}
            </CustomForm>
        </CustomModal>
    );
};
