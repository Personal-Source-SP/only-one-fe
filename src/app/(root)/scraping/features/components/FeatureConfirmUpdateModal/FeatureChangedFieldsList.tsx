'use client';

import {
    CustomAlert,
    CustomCard,
    CustomFlex,
    CustomTag,
    CustomTypography,
} from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { useFeatureModalContext } from '../../context';

export const FeatureChangedFieldsList = () => {
    const { diffItems } = useFeatureModalContext();

    if (diffItems.length === 0) {
        return (
            <CustomAlert
                showIcon
                type="info"
                title="Không phát hiện thay đổi"
                description="Các giá trị trên form hoàn toàn trùng khớp với phiên bản hiện tại. Việc lưu lại vẫn sẽ tạo một snapshot ghi chú mới."
            />
        );
    }

    return (
        <CustomFlex
            vertical
            gap="small"
            className="w-full max-h-[360px] overflow-y-auto custom-scrollbar border border-hub-border/60 rounded-xl p-3 bg-hub-gray/30"
        >
            <div className="flex items-center justify-between px-1 pb-1 border-b border-hub-border/40 shrink-0">
                <CustomTypography.Text className="text-xs font-semibold text-hub-title">
                    Danh sách thông số đã thay đổi ({diffItems.length})
                </CustomTypography.Text>
                <CustomTypography.Text type="secondary" className="text-[11px]">
                    Giá trị mới áp dụng cho snapshot
                </CustomTypography.Text>
            </div>

            <CustomFlex vertical gap={8} className="pt-1">
                {diffItems.map((item) => (
                    <CustomCard
                        key={item.key}
                        size="small"
                        className="!border-hub-border/50 hover:!border-hub-primary/40 transition-colors shadow-sm [&_.ant-card-body]:!p-2.5"
                    >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-1.5">
                                <Icon
                                    icon="lucide:check-circle-2"
                                    className="text-hub-primary text-sm shrink-0"
                                />
                                <span className="text-xs font-semibold text-hub-title">
                                    {item.label}
                                </span>
                            </div>
                            {item.section && (
                                <CustomTag
                                    color="default"
                                    className="text-[10px] m-0 !border-none bg-hub-gray/60"
                                >
                                    {item.section}
                                </CustomTag>
                            )}
                        </div>

                        {item.isCode ? (
                            <div className="rounded-md border border-gray-200 dark:border-gray-800 bg-gray-900 text-gray-100 p-2.5 font-mono text-xs overflow-auto max-h-[160px]">
                                <pre className="m-0 whitespace-pre-wrap break-all leading-relaxed">
                                    {item.displayNewValue}
                                </pre>
                            </div>
                        ) : (
                            <div className="text-xs font-mono text-hub-title bg-hub-gray/40 dark:bg-hub-gray/20 px-2.5 py-1.5 rounded-md border border-hub-border/40 break-all">
                                {item.displayNewValue}
                            </div>
                        )}
                    </CustomCard>
                ))}
            </CustomFlex>
        </CustomFlex>
    );
};
