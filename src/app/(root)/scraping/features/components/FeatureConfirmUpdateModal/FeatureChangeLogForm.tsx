'use client';

import { CustomForm, CustomInput, type FormInstance } from '@/components/custom-antd';

export interface FeatureChangeLogFormProps {
    form: FormInstance;
    onFinish: (values: { changeDescription: string }) => Promise<void>;
}

export const FeatureChangeLogForm = ({ form, onFinish }: FeatureChangeLogFormProps) => {
    return (
        <CustomForm form={form} layout="vertical" onFinish={onFinish} className="mt-2">
            <CustomForm.Item
                name="changeDescription"
                label="Lý do thay đổi phiên bản (Change Log)"
                rules={[
                    {
                        required: true,
                        message: 'Vui lòng nhập lý do thay đổi trước khi lưu snapshot',
                    },
                ]}
                className="!mb-0"
            >
                <CustomInput.TextArea
                    rows={3}
                    placeholder="Ví dụ: Cập nhật selector giá mới theo layout 2026, tăng timeout lên 30s..."
                />
            </CustomForm.Item>
        </CustomForm>
    );
};
