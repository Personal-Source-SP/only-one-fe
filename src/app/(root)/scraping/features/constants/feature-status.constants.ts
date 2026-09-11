import { DataProviderFeatureStatus } from '../enums';

export type FeatureStatusDefinition = {
    status: DataProviderFeatureStatus;
    label: string;
    actionLabel: string;
    description: string;
    tagColor: 'success' | 'warning' | 'default' | 'error';
    dotClass: string;
    pulseClass: string;
    pillClass: string;
    icon: string;
    requiresRunnerTest?: boolean;
    confirmTitle?: string;
    confirmWarning?: string;
    selectable?: boolean;
};

export const FEATURE_STATUS_TRANSITIONS: Record<
    DataProviderFeatureStatus,
    readonly DataProviderFeatureStatus[]
> = {
    [DataProviderFeatureStatus.UNCONFIGURED]: [],
    [DataProviderFeatureStatus.READY]: [
        DataProviderFeatureStatus.TESTING,
        DataProviderFeatureStatus.DISABLED,
    ],
    [DataProviderFeatureStatus.TESTING]: [
        DataProviderFeatureStatus.READY,
        DataProviderFeatureStatus.DISABLED,
    ],
    [DataProviderFeatureStatus.DISABLED]: [
        DataProviderFeatureStatus.READY,
        DataProviderFeatureStatus.TESTING,
    ],
    [DataProviderFeatureStatus.ERROR]: [
        DataProviderFeatureStatus.READY,
        DataProviderFeatureStatus.TESTING,
        DataProviderFeatureStatus.DISABLED,
    ],
} as const;

export const DATA_PROVIDER_FEATURE_STATUS_CONFIG: Record<
    DataProviderFeatureStatus,
    FeatureStatusDefinition
> = {
    [DataProviderFeatureStatus.READY]: {
        status: DataProviderFeatureStatus.READY,
        label: 'Sẵn sàng hoạt động',
        actionLabel: 'Kích hoạt tính năng',
        description: 'Tính năng sẵn sàng phục vụ các yêu cầu cào dữ liệu thực tế.',
        tagColor: 'success',
        dotClass: 'bg-emerald-500',
        pulseClass: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]',
        pillClass:
            'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
        icon: 'lucide:check-circle-2',
        selectable: true,
        requiresRunnerTest: true,
        confirmTitle: 'Xác nhận Kích hoạt Tính năng (READY)',
        confirmWarning:
            'Hệ thống sẽ tự động thực thi Runner Kiểm thử (testContextual) để xác thực cấu hình tính năng trên môi trường thực tế trước khi kích hoạt.',
    },
    [DataProviderFeatureStatus.TESTING]: {
        status: DataProviderFeatureStatus.TESTING,
        label: 'Chạy thử nghiệm',
        actionLabel: 'Chuyển sang thử nghiệm',
        description: 'Chỉ phục vụ mục đích kiểm thử nội bộ, chưa kích hoạt tự động.',
        tagColor: 'warning',
        dotClass: 'bg-amber-500',
        pulseClass: 'bg-amber-500 animate-pulse',
        pillClass:
            'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
        icon: 'lucide:flask-conical',
        selectable: true,
        confirmTitle: 'Chuyển sang Chế độ Thử nghiệm (TESTING)',
        confirmWarning:
            'Tính năng sẽ được chuyển sang chế độ thử nghiệm nội bộ để kiểm tra hoặc gỡ lỗi cấu hình.',
    },
    [DataProviderFeatureStatus.DISABLED]: {
        status: DataProviderFeatureStatus.DISABLED,
        label: 'Tạm ngưng',
        actionLabel: 'Tạm ngưng hoạt động',
        description: 'Dừng hoàn toàn việc nhận các tác vụ scraping cho tính năng này.',
        tagColor: 'default',
        dotClass: 'bg-slate-400',
        pulseClass: 'bg-slate-400',
        pillClass:
            'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        icon: 'lucide:pause-circle',
        selectable: true,
        confirmTitle: 'Xác nhận Tạm ngưng Tính năng (DISABLED)',
        confirmWarning:
            'Tất cả các tác vụ cào dữ liệu liên quan đến tính năng này sẽ bị tạm dừng cho đến khi được kích hoạt lại.',
    },
    [DataProviderFeatureStatus.ERROR]: {
        status: DataProviderFeatureStatus.ERROR,
        label: 'Sự cố / Lỗi',
        actionLabel: 'Đánh dấu sự cố',
        description: 'Phát hiện sự cố khi thực thi runner hoặc kết nối nguồn dữ liệu.',
        tagColor: 'error',
        dotClass: 'bg-rose-500',
        pulseClass: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse',
        pillClass:
            'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
        icon: 'lucide:alert-triangle',
        selectable: false,
    },
    [DataProviderFeatureStatus.UNCONFIGURED]: {
        status: DataProviderFeatureStatus.UNCONFIGURED,
        label: 'Chưa cấu hình',
        actionLabel: 'Chưa cấu hình',
        description: 'Cần thiết lập và lưu thông số cấu hình trước khi kích hoạt.',
        tagColor: 'default',
        dotClass: 'bg-slate-300 dark:bg-slate-600',
        pulseClass: 'bg-slate-300',
        pillClass:
            'bg-slate-50 text-slate-400 border-dashed border-slate-300 dark:bg-slate-900 dark:text-slate-500 dark:border-slate-700',
        icon: 'lucide:settings-2',
        selectable: false,
    },
};

export const SELECTABLE_FEATURE_STATUSES: DataProviderFeatureStatus[] = [
    DataProviderFeatureStatus.READY,
    DataProviderFeatureStatus.TESTING,
    DataProviderFeatureStatus.DISABLED,
];

export const isTransitionAllowed = (
    currentStatus: DataProviderFeatureStatus,
    targetStatus: DataProviderFeatureStatus,
): boolean => {
    if (currentStatus === targetStatus) return false;
    return FEATURE_STATUS_TRANSITIONS[currentStatus]?.includes(targetStatus) ?? false;
};

export const getAvailableTargetStatuses = (
    currentStatus: DataProviderFeatureStatus,
): DataProviderFeatureStatus[] => {
    return (FEATURE_STATUS_TRANSITIONS[currentStatus] || []) as DataProviderFeatureStatus[];
};
