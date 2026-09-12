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
    loading?: boolean;
    dataProviderOptions?: CustomSelectProps['options'];
    onCancel: () => void;
    onSubmit: (values: CreateSessionFormValues) => void;
}

export const CreateSessionModal = ({
    open,
    loading = false,
    dataProviderOptions,
    onCancel,
    onSubmit,
}: CreateSessionModalProps) => {
    const [form] = CustomForm.useForm<CreateSessionFormValues>();

    useEffect(() => {
        if (open) {
            form.resetFields();
            form.setFieldsValue({ depth: 1 });
        }
    }, [open, form]);

    const handleOk = async () => {
        const values = await form.validateFields();
        const rawKeywords = values.targetKeywords;
        const targetKeywords = rawKeywords
            ? rawKeywords
                  .split(',')
                  .map((k) => k.trim())
                  .filter(Boolean)
            : [];

        onSubmit({
            dataProviderId: values.dataProviderId,
            targetKeywords,
            depth: values.depth,
            maxUrls: values.maxUrls,
        });
    };

    return (
        <CustomModal
            centered
            open={open}
            cancelText="Hủy"
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={loading}
            okText="Bắt đầu khám phá"
            title="Khởi tạo phiên khám phá mới (Discovery Session)"
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
                    name="targetKeywords"
                    label="Từ khóa sản phẩm mục tiêu (Target Keywords)"
                >
                    <CustomInput.TextArea
                        rows={3}
                        placeholder="Nhập các từ khóa cách nhau bởi dấu phẩy (ví dụ: Sony WH-1000XM4, iPhone 15 Pro, ...)"
                    />
                </CustomForm.Item>

                <CustomForm.Item name="depth" label="Độ sâu thu thập (Crawl Depth)">
                    <CustomInputNumber min={1} max={5} className="w-full" />
                </CustomForm.Item>

                <CustomForm.Item
                    name="maxUrls"
                    label="Giới hạn URLs tối đa (Max URLs - Tùy chọn override)"
                >
                    <CustomInputNumber
                        min={1}
                        max={1000}
                        className="w-full"
                        placeholder="Mặc định lấy theo cấu hình Search"
                    />
                </CustomForm.Item>
            </CustomForm>
        </CustomModal>
    );
};
