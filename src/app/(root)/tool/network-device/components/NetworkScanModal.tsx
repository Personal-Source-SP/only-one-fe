import { FormModalContainer } from '@/components/common';
import type { UseCustomModalFormResponse } from '@/hooks';
import type { IFormSection } from '@/interfaces';
import { FormRuleType } from '@/utilities';
import type { BaseRecord } from '@refinedev/core';
import { useMemo } from 'react';
import type { ITriggerScanRequest } from '../types';

type NetworkScanModalProps = {
    modalForm: UseCustomModalFormResponse<BaseRecord, ITriggerScanRequest>;
};

export const NetworkScanModal = ({ modalForm }: NetworkScanModalProps) => {
    const scanFormSections: IFormSection<ITriggerScanRequest>[] = useMemo(
        () => [
            {
                type: 'plain',
                fields: [
                    {
                        name: 'subnet',
                        label: 'Dải mạng Subnet (Tùy chọn)',
                        type: 'input',
                        placeholder: 'Để trống để tự động nhận diện (vd: 192.168.1)',
                        formItemProps: {
                            tooltip:
                                'Ví dụ: 192.168.1. Nếu để trống, hệ thống sẽ tự động phát hiện theo địa chỉ IP của card mạng server.',
                        },
                    },
                    {
                        name: 'probeTimeoutMs',
                        label: 'Thời gian chờ phản hồi UDP probe (ms)',
                        type: 'number',
                        numberProps: {
                            min: 1000,
                            max: 10000,
                            step: 500,
                            className: 'w-full',
                        },
                        rulesConfig: [
                            {
                                type: FormRuleType.Required,
                                message: 'Vui lòng nhập timeout',
                            },
                        ],
                    },
                ],
            },
        ],
        [],
    );

    return (
        <FormModalContainer
            modalForm={modalForm}
            okText="Bắt đầu quét"
            title="🔍 Kích hoạt Quét Mạng LAN"
            sections={scanFormSections}
            createInitialValues={{
                probeTimeoutMs: 3000,
            }}
        />
    );
};
