'use client';

import {
    CustomAlert,
    CustomCard,
    CustomFlex,
    CustomTag,
    CustomTypography,
} from '@/components/custom-antd';
import type { IApproachResultResponse } from '../types';

const { Text } = CustomTypography;

type ApproachResultCardProps = {
    result: IApproachResultResponse;
};

export const ApproachResultCard = ({ result }: ApproachResultCardProps) => {
    return (
        <CustomCard
            size="small"
            className="mt-4 border-slate-200"
            title={
                <CustomFlex justify="space-between" align="center">
                    <Text strong>📋 Kết quả thực thi</Text>
                    <CustomTag color={result.isSuccess ? 'success' : 'error'}>
                        {result.isSuccess ? 'THÀNH CÔNG' : 'THẤT BÀI'} ({result.responseTimeMs}ms)
                    </CustomTag>
                </CustomFlex>
            }
        >
            {result.errorMessage && (
                <CustomAlert
                    type="error"
                    showIcon
                    title={result.errorMessage}
                    className="mb-2 text-xs"
                />
            )}

            {result.matchedCredential && (
                <div className="mb-2 p-2 bg-emerald-50 rounded border border-emerald-200 text-xs">
                    <Text strong className="text-emerald-700">
                        🔑 Tài khoản xác thực khớp: {result.matchedCredential.username} /{' '}
                        {result.matchedCredential.password || '(trống)'}
                    </Text>
                </div>
            )}

            {result.data && (
                <div>
                    <Text type="secondary" className="text-xs block mb-1">
                        Payload phản hồi (JSON):
                    </Text>
                    <pre className="p-2 bg-slate-900 text-slate-100 rounded text-xs overflow-x-auto max-h-60">
                        {JSON.stringify(result.data, null, 2)}
                    </pre>
                </div>
            )}
        </CustomCard>
    );
};
