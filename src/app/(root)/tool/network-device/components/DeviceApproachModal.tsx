'use client';

import {
    CustomButton,
    CustomFlex,
    CustomForm,
    CustomInput,
    CustomInputNumber,
    CustomModal,
    CustomRadio,
    CustomSelect,
    CustomSpace,
    CustomTypography,
} from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { useEffect } from 'react';
import { APPROACH_CONFIG } from '../constants';
import { NetworkDeviceApproachEnum } from '../enums';
import type { IApproachResultResponse, IExecuteApproachRequest, INetworkDevice } from '../types';
import { ApproachResultCard } from './ApproachResultCard';

const { Text } = CustomTypography;

type DeviceApproachModalProps = {
    device: INetworkDevice | null;
    result: IApproachResultResponse | null;
    open: boolean;
    loading: boolean;
    onClose: () => void;
    onExecute: (payload: IExecuteApproachRequest) => Promise<void>;
};

export const DeviceApproachModal = ({
    open,
    loading,
    device,
    result,
    onClose,
    onExecute,
}: DeviceApproachModalProps) => {
    const [form] = CustomForm.useForm<IExecuteApproachRequest>();
    const currentApproach = CustomForm.useWatch('approach', form);

    useEffect(() => {
        if (open) {
            form.setFieldsValue({
                approach: NetworkDeviceApproachEnum.PROTOCOL_AUTH,
                ip: device?.ipAddress || '',
                mac: device?.macAddress || '',
                timeoutMs: 3000,
                ports: device?.openPorts?.length ? device.openPorts : [80, 554, 8000, 37777],
                credentials: [
                    { username: 'admin', password: '' },
                    { username: 'admin', password: 'admin' },
                ],
            });
        }
    }, [open, device, form]);

    const handleSubmit = async () => {
        const values = await form.validateFields();
        await onExecute(values);
    };

    return (
        <CustomModal
            title={
                <CustomFlex align="center" gap="small">
                    <Icon icon="mdi:flash" width={22} height={22} className="text-amber-500" />
                    <span>Chẩn Đoán & Tiếp Cận Thiết Bị</span>
                </CustomFlex>
            }
            open={open}
            onCancel={onClose}
            width={680}
            footer={
                <CustomFlex justify="flex-end" gap="small">
                    <CustomButton onClick={onClose}>Đóng</CustomButton>
                    <CustomButton
                        type="primary"
                        icon={<Icon icon="mdi:play" />}
                        onClick={handleSubmit}
                        loading={loading}
                    >
                        Bắt Đầu Thực Thi
                    </CustomButton>
                </CustomFlex>
            }
        >
            <CustomForm form={form} layout="vertical">
                <CustomForm.Item
                    name="approach"
                    label="Phương thức tiếp cận (Approach Type)"
                    rules={[{ required: true }]}
                >
                    <CustomRadio.Group className="w-full">
                        <CustomSpace direction="vertical" className="w-full">
                            {Object.entries(APPROACH_CONFIG).map(([key, cfg]) => (
                                <CustomRadio key={key} value={key}>
                                    <span className="font-semibold">{cfg.label}</span>
                                    <div className="text-xs text-slate-500">{cfg.description}</div>
                                </CustomRadio>
                            ))}
                        </CustomSpace>
                    </CustomRadio.Group>
                </CustomForm.Item>

                <CustomForm.Item
                    name="ip"
                    label="Địa chỉ IP mục tiêu"
                    rules={[
                        {
                            required:
                                currentApproach !== NetworkDeviceApproachEnum.NETWORK_DISCOVERY,
                        },
                    ]}
                >
                    <CustomInput placeholder="vd: 192.168.1.100" />
                </CustomForm.Item>

                {currentApproach === NetworkDeviceApproachEnum.PORT_SCAN && (
                    <CustomForm.Item
                        name="ports"
                        label="Danh sách cổng TCP cần kiểm tra"
                        tooltip="Nhập các cổng TCP và nhấn Enter để thêm"
                    >
                        <CustomSelect
                            mode="tags"
                            placeholder="vd: 80, 554, 8000, 37777"
                            className="w-full"
                        />
                    </CustomForm.Item>
                )}

                {currentApproach === NetworkDeviceApproachEnum.PROTOCOL_AUTH && (
                    <div>
                        <Text strong className="block mb-2 text-xs">
                            Danh sách Tài khoản Xác thực (Credentials):
                        </Text>
                        <CustomForm.List name="credentials">
                            {(fields, { add, remove }) => (
                                <CustomSpace direction="vertical" className="w-full">
                                    {fields.map(({ key, name, ...restField }) => (
                                        <CustomFlex key={key} gap="small" align="center">
                                            <CustomForm.Item
                                                {...restField}
                                                name={[name, 'username']}
                                                className="!mb-0 flex-1"
                                                rules={[
                                                    { required: true, message: 'Nhập username' },
                                                ]}
                                            >
                                                <CustomInput placeholder="Username" />
                                            </CustomForm.Item>
                                            <CustomForm.Item
                                                {...restField}
                                                name={[name, 'password']}
                                                className="!mb-0 flex-1"
                                            >
                                                <CustomInput.Password placeholder="Password (để trống nếu ko có)" />
                                            </CustomForm.Item>
                                            <CustomButton
                                                danger
                                                type="text"
                                                icon={<Icon icon="mdi:delete" />}
                                                onClick={() => remove(name)}
                                            />
                                        </CustomFlex>
                                    ))}
                                    <CustomButton
                                        type="dashed"
                                        onClick={() => add()}
                                        block
                                        icon={<Icon icon="mdi:plus" />}
                                    >
                                        Thêm Credential
                                    </CustomButton>
                                </CustomSpace>
                            )}
                        </CustomForm.List>
                    </div>
                )}

                <CustomForm.Item name="timeoutMs" label="Thời gian Timeout (ms)" className="mt-4">
                    <CustomInputNumber min={500} max={30000} step={500} className="w-full" />
                </CustomForm.Item>
            </CustomForm>

            {/* Execution Result Box */}
            {result && <ApproachResultCard result={result} />}
        </CustomModal>
    );
};
