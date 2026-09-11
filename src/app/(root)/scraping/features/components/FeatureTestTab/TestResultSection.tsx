'use client';

import { CodeDisplay } from '@/components/common';
import {
    CustomAlert,
    CustomEmpty,
    CustomFlex,
    CustomTag,
    CustomTypography,
} from '@/components/custom-antd';
import { FEATURE_SECTION_CONTAINER_CLASS } from '../../constants';
import { useFeatureTestContext } from '../../context';
import { SectionHeader } from '../ConfigFormCommon';

export const TestResultSection = () => {
    const { testResult, errorMessage } = useFeatureTestContext();
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

            <CustomFlex vertical className={FEATURE_SECTION_CONTAINER_CLASS}>
                <SectionHeader
                    title="Kết quả trích xuất"
                    icon="lucide:code"
                    description="Dữ liệu JSON thực thi từ hàm functionGenerator trong môi trường Sandbox"
                    badge={testResult ? 'Thành công' : undefined}
                    badgeColor="success"
                />

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
