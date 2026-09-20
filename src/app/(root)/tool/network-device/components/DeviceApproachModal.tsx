'use client';

import { FormModalContainer } from '@/components';
import { CustomFlex, CustomForm } from '@/components';
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

type DeviceApproachModalProps = {
    result: IApproachResultResponse | null;
    modalForm: UseCustomModalFormResponse<BaseRecord, IExecuteApproachRequest>;
};

export const DeviceApproachModal = ({ result, modalForm }: DeviceApproachModalProps) => {
    const currentApproach = CustomForm.useWatch('approach', modalForm.formProps.form);

    const sectionForm: IFormSection<IExecuteApproachRequest>[] = useMemo(
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
                        type: 'list',
                        label: 'Danh sách Tài khoản Xác thực (Credentials)',
                        visible: currentApproach === NetworkDeviceApproachEnum.PROTOCOL_AUTH,
                        addText: 'Thêm Credential',
                        subFields: [
                            {
                                name: 'username',
                                placeholder: 'Username',
                                type: 'input',
                                colSpan: 11,
                                rulesConfig: [
                                    {
                                        type: FormRuleType.Required,
                                        message: 'Nhập username',
                                    },
                                ],
                            },
                            {
                                name: 'password',
                                placeholder: 'Password (để trống nếu ko có)',
                                type: 'password',
                                colSpan: 11,
                            },
                        ],
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

    const titleModal = useMemo(
        () => (
            <CustomFlex align="center" gap="small">
                <Icon icon="mdi:flash" width={22} height={22} className="text-amber-500" />
                <span>Chẩn Đoán & Tiếp Cận Thiết Bị</span>
            </CustomFlex>
        ),
        [],
    );

    return (
        <FormModalContainer
            title={titleModal}
            sections={sectionForm}
            modalForm={modalForm}
            okText="Bắt Đầu Thực Thi"
        />
    );
};
