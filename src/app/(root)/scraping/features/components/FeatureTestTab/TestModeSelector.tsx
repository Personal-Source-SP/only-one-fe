'use client';

import { CustomFlex, CustomSegmented, CustomTypography } from '@/components/custom-antd';
import { Icon } from '@iconify/react';

export type TestModeSelectorProps = {
    testMode: 'stateless' | 'contextual';
    isDraft?: boolean;
    onChangeMode: (mode: 'stateless' | 'contextual') => void;
};

export const TestModeSelector = ({ testMode, isDraft, onChangeMode }: TestModeSelectorProps) => {
    return (
        <CustomFlex
            vertical
            className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4"
        >
            <CustomFlex
                align="center"
                justify="space-between"
                gap="middle"
                className="w-full flex-wrap"
            >
                <CustomFlex vertical gap={2}>
                    <CustomFlex align="center" gap="small">
                        <Icon icon="lucide:flask-conical" className="text-hub-primary" />
                        <CustomTypography.Text strong className="text-sm text-hub-title">
                            Chế độ thử nghiệm
                        </CustomTypography.Text>
                    </CustomFlex>

                    <CustomTypography.Paragraph
                        type="secondary"
                        className="!mb-0 text-xs text-hub-subtitle"
                    >
                        {testMode === 'stateless'
                            ? 'Stateless Sandbox: Chạy trực tiếp cấu hình với input tùy chỉnh độc lập.'
                            : 'Contextual Test: Chạy cấu hình đã lưu trên backend với provider hiện tại.'}
                    </CustomTypography.Paragraph>
                </CustomFlex>

                <CustomSegmented
                    value={testMode}
                    onChange={(value) => onChangeMode(value as 'stateless' | 'contextual')}
                    options={[
                        { label: 'Stateless Sandbox', value: 'stateless' },
                        {
                            disabled: isDraft,
                            value: 'contextual',
                            label: 'Contextual Test',
                        },
                    ]}
                />
            </CustomFlex>
        </CustomFlex>
    );
};
