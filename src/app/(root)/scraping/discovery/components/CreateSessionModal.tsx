'use client';

import {
    CustomForm,
    CustomInput,
    CustomInputNumber,
    CustomModal,
    CustomSelect,
    type CustomSelectProps,
} from '@/components/custom-antd';
import { useEffect } from 'react';
import type { CreateSessionFormValues } from '../types';

interface CreateSessionModalProps {
    open: boolean;
    onCancel: () => void;
    onSubmit: (values: CreateSessionFormValues) => void;
    dataProviderOptions?: CustomSelectProps['options'];
}

export const CreateSessionModal = ({
    open,
    onCancel,
    onSubmit,
    dataProviderOptions,
}: CreateSessionModalProps) => {
    const [form] = CustomForm.useForm<CreateSessionFormValues>();

    useEffect(() => {
        if (open) {
            form.resetFields();
            form.setFieldsValue({ depth: 1, maxUrls: 50 });
        }
    }, [open, form]);

    const handleOk = async () => {
        const values = await form.validateFields();
        onSubmit(values);
    };

    return (
        <CustomModal
            open={open}
            title="Khởi tạo phiên khám phá mới (Discovery Session)"
            onCancel={onCancel}
            onOk={handleOk}
            okText="Bắt đầu khám phá"
            cancelText="Hủy"
            destroyOnClose
        >
            <CustomForm form={form} layout="vertical">
                <CustomForm.Item
                    name="dataProviderId"
                    label="Nhà cung cấp dữ liệu"
                    rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp' }]}
                >
                    <CustomSelect placeholder="Chọn nhà cung cấp" options={dataProviderOptions} />
                </CustomForm.Item>

                <CustomForm.Item
                    name="targetUrl"
                    label="Đường dẫn khám phá (Seed URL)"
                    rules={[
                        { required: true, message: 'Vui lòng nhập đường dẫn' },
                        { type: 'url', message: 'Đường dẫn không hợp lệ' },
                    ]}
                >
                    <CustomInput placeholder="https://example.com/category/products" />
                </CustomForm.Item>

                <CustomForm.Item name="depth" label="Độ sâu thu thập (Crawl Depth)">
                    <CustomInputNumber min={1} max={5} className="w-full" />
                </CustomForm.Item>
            </CustomForm>
        </CustomModal>
    );
};
