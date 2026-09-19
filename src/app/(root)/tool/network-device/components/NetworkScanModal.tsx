import {
    CustomButton,
    CustomFlex,
    CustomForm,
    CustomInput,
    CustomInputNumber,
    CustomModal,
} from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import type { ITriggerScanRequest } from '../types';

type NetworkScanModalProps = {
    open: boolean;
    loading: boolean;
    onClose: () => void;
    onSubmit: (values: ITriggerScanRequest) => Promise<void>;
};

export const NetworkScanModal = ({ open, onClose, onSubmit, loading }: NetworkScanModalProps) => {
    const [form] = CustomForm.useForm<ITriggerScanRequest>();

    const handleOk = async () => {
        const values = await form.validateFields();
        await onSubmit(values);
        form.resetFields();
    };

    return (
        <CustomModal
            title="🔍 Kích hoạt Quét Mạng LAN"
            open={open}
            onCancel={onClose}
            width={520}
            footer={
                <CustomFlex justify="flex-end" gap="small">
                    <CustomButton onClick={onClose}>Hủy</CustomButton>
                    <CustomButton
                        type="primary"
                        icon={<Icon icon="mdi:radar" />}
                        onClick={handleOk}
                        loading={loading}
                    >
                        Bắt đầu quét
                    </CustomButton>
                </CustomFlex>
            }
        >
            <CustomForm
                form={form}
                layout="vertical"
                initialValues={{
                    probeTimeoutMs: 3000,
                }}
            >
                <CustomForm.Item
                    name="subnet"
                    label="Dải mạng Subnet (Tùy chọn)"
                    tooltip="Ví dụ: 192.168.1. Nếu để trống, hệ thống sẽ tự động phát hiện theo địa chỉ IP của card mạng server."
                >
                    <CustomInput placeholder="Để trống để tự động nhận diện (vd: 192.168.1)" />
                </CustomForm.Item>

                <CustomForm.Item
                    name="probeTimeoutMs"
                    label="Thời gian chờ phản hồi UDP probe (ms)"
                    rules={[{ required: true, message: 'Vui lòng nhập timeout' }]}
                >
                    <CustomInputNumber min={1000} max={10000} step={500} className="w-full" />
                </CustomForm.Item>
            </CustomForm>
        </CustomModal>
    );
};
