'use client';

import { CustomFormList, FormModalContainer } from '@/components/common';
import {
    CustomButton,
    CustomFlex,
    CustomForm,
    CustomInput,
    CustomSpace,
    CustomTypography,
} from '@/components/custom-antd';
import type { UseCustomModalFormResponse } from '@/hooks';
import type { IFormSection } from '@/interfaces';
import { FormRuleType } from '@/utilities';
import type { BaseRecord } from '@refinedev/core';
import { Icon } from '@iconify/react';
import { useMemo } from 'react';
import { APPROACH_CONFIG } from '../constants';
import { NetworkDeviceApproachEnum } from '../enums';
import type { IApproachResultResponse, IExecuteApproachRequest } from '../types';
import { ApproachResultCard } from './ApproachResultCard';

const { Text } = CustomTypography;

type DeviceApproachModalProps = {
    modalForm: UseCustomModalFormResponse<BaseRecord, IExecuteApproachRequest>;
    result: IApproachResultResponse | null;
};

export const DeviceApproachModal = ({ modalForm, result }: DeviceApproachModalProps) => {
    const currentApproach =
        CustomForm.useWatch('approach', modalForm.formProps.form) ||
        NetworkDeviceApproachEnum.PROTOCOL_AUTH;

    const sections: IFormSection<IExecuteApproachRequest>[] = useMemo(
        () => [
            {
                type: 'plain',
                fields: [
                    {
                        name: 'approach',
                        label: 'Phương thức tiếp cận (Approach Type)',
                        type: 'radio_group',
                        options: Object.entries(APPROACH_CONFIG).map(([key, cfg]) => ({
                            value: key,
                            label: (
                                <div>
                                    <span className="font-semibold">{cfg.label}</span>
                                    <div className="text-xs text-slate-500">{cfg.description}</div>
                                </div>
                            ),
                        })),
                        radioGroupProps: {
                            className: 'flex flex-col gap-2 w-full',
                        },
                        rulesConfig: [
                            {
                                type: FormRuleType.Required,
                                message: 'Vui lòng chọn phương thức tiếp cận',
                            },
                        ],
                    },
                    {
                        name: 'ip',
                        label: 'Địa chỉ IP mục tiêu',
                        type: 'input',
                        placeholder: 'vd: 192.168.1.100',
                        rulesConfig: [
                            {
                                type: FormRuleType.Required,
                                message: 'Vui lòng nhập địa chỉ IP mục tiêu',
                            },
                        ],
                    },
                    {
                        name: 'ports',
                        label: 'Danh sách cổng TCP cần kiểm tra',
                        type: 'select',
                        visible: currentApproach === NetworkDeviceApproachEnum.PORT_SCAN,
                        selectProps: {
                            mode: 'tags',
                            placeholder: 'vd: 80, 554, 8000, 37777',
                            className: 'w-full',
                        },
                        formItemProps: {
                            tooltip: 'Nhập các cổng TCP và nhấn Enter để thêm',
                        },
                    },
                    {
                        name: 'credentials',
                        type: 'custom',
                        visible: currentApproach === NetworkDeviceApproachEnum.PROTOCOL_AUTH,
                        render: () => (
                            <div>
                                <Text strong className="block mb-2 text-xs">
                                    Danh sách Tài khoản Xác thực (Credentials):
                                </Text>
                                <CustomFormList name="credentials" addText="Thêm Credential">
                                    {(fields, { remove }) => (
                                        <CustomSpace direction="vertical" className="w-full">
                                            {fields.map(({ key, name, ...restField }) => (
                                                <CustomFlex key={key} gap="small" align="center">
                                                    <CustomForm.Item
                                                        {...restField}
                                                        name={[name, 'username']}
                                                        className="!mb-0 flex-1"
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: 'Nhập username',
                                                            },
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
                                        </CustomSpace>
                                    )}
                                </CustomFormList>
                            </div>
                        ),
                    },
                    {
                        name: 'timeoutMs',
                        label: 'Thời gian Timeout (ms)',
                        type: 'number',
                        numberProps: {
                            min: 500,
                            max: 30000,
                            step: 500,
                            className: 'w-full',
                        },
                    },
                    {
                        name: 'resultCard',
                        type: 'custom',
                        visible: !!result,
                        render: () => (result ? <ApproachResultCard result={result} /> : null),
                    },
                ],
            },
        ],
        [currentApproach, result],
    );

    return (
        <FormModalContainer
            modalForm={modalForm}
            sections={sections}
            okText="Bắt Đầu Thực Thi"
            title={
                <CustomFlex align="center" gap="small">
                    <Icon icon="mdi:flash" width={22} height={22} className="text-amber-500" />
                    <span>Chẩn Đoán & Tiếp Cận Thiết Bị</span>
                </CustomFlex>
            }
        />
    );
};
