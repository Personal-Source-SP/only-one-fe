'use client';

import { CustomButton, CustomCard } from '@/components/custom-antd';
import { Icon } from '@iconify/react';

export type DataNotFoundProps = {
    icon?: string;
    title?: string;
    message?: string;
    loading?: boolean;
    compact?: boolean;
    className?: string;
    onRetry?: () => void;
};

export const DataNotFound = ({
    icon = 'lucide:folder-open',
    title = 'Không có dữ liệu',
    message = 'Vui lòng kiểm tra lại kết nối hoặc thử lại sau.',
    loading,
    compact = false,
    className = '',
    onRetry,
}: DataNotFoundProps) => {
    if (compact) {
        return (
            <div
                className={`flex flex-col items-center justify-center gap-2 py-8 px-4 text-center ${className}`.trim()}
            >
                <Icon icon={icon} className="text-4xl text-gray-400 dark:text-gray-600" />
                <p className="text-base font-medium text-gray-700 dark:text-gray-300 !mb-0">
                    {title}
                </p>
                {message && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 !mb-0">{message}</p>
                )}
                {onRetry && (
                    <CustomButton
                        size="small"
                        type="primary"
                        loading={!!loading}
                        onClick={onRetry}
                        className="mt-2"
                    >
                        <span className="inline-flex items-center">
                            <Icon icon="lucide:refresh-ccw" className="mr-1.5" /> Thử lại
                        </span>
                    </CustomButton>
                )}
            </div>
        );
    }

    return (
        <div className={`flex items-center justify-center bg-transparent ${className}`.trim()}>
            <CustomCard className="max-w-xl w-full mx-4">
                <div className="flex flex-col items-center gap-4 py-10">
                    <Icon icon={icon} className="text-5xl text-foreground-400" />
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <p className="text-foreground-500 text-center">{message}</p>

                    {onRetry ? (
                        <div className="flex gap-3">
                            <CustomButton type="primary" loading={!!loading} onClick={onRetry}>
                                <span className="inline-flex items-center">
                                    <Icon icon="lucide:refresh-ccw" className="mr-2" /> Thử lại
                                </span>
                            </CustomButton>
                        </div>
                    ) : (
                        <></>
                    )}
                </div>
            </CustomCard>
        </div>
    );
};
