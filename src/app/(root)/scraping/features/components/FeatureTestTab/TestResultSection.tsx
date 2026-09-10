'use client';

import { CodeDisplay } from '@/components/common';
import {
    CustomAlert,
    CustomEmpty,
    CustomFlex,
    CustomTag,
    CustomTypography,
} from '@/components/custom-antd';
import { Icon } from '@iconify/react';

export type TestResultSectionProps = {
    testResult: any;
    errorMessage: string | null;
};

export const TestResultSection = ({ testResult, errorMessage }: TestResultSectionProps) => {
    return (
        <>
            {errorMessage && (
                <CustomAlert
                    type="error"
                    description={errorMessage}
                    title="Thử nghiệm phát sinh lỗi"
                    className="rounded-xl border-rose-500/20 bg-rose-500/10"
                />
            )}

            <CustomFlex
                vertical
                className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4 w-full"
            >
                <CustomFlex align="center" justify="space-between" className="mb-3 w-full">
                    <CustomFlex align="center" gap="small">
                        <Icon icon="lucide:code" className="text-hub-primary" />
                        <CustomTypography.Text strong className="text-sm text-hub-title">
                            Kết quả trích xuất (Execution Output)
                        </CustomTypography.Text>
                    </CustomFlex>

                    {testResult && (
                        <CustomTag color="success" className="font-medium m-0">
                            Thành công
                        </CustomTag>
                    )}
                </CustomFlex>

                {testResult ? (
                    <CodeDisplay language="json" code={JSON.stringify(testResult, null, 2)} />
                ) : (
                    <CustomEmpty
                        description={
                            <CustomTypography.Text type="secondary" className="text-xs">
                                Chưa có dữ liệu kết quả. Nhập URL/Query và nhấn &ldquo;Chạy thử
                                nghiệm&rdquo; để xem kết quả.
                            </CustomTypography.Text>
                        }
                        className="p-6 border border-dashed border-hub-border/60 rounded-lg bg-hub-card/50 my-0"
                    />
                )}
            </CustomFlex>
        </>
    );
};
