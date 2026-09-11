import { DataProviderFeatureStatus } from '../enums';

export type FeatureStatusDefinition = {
    icon: string;
    label: string;
    tagColor: string;
    dotClass: string;
    selectable: boolean;
    status: DataProviderFeatureStatus;
};

export const DATA_PROVIDER_FEATURE_STATUS_CONFIG: Record<
    DataProviderFeatureStatus,
    FeatureStatusDefinition
> = {
    [DataProviderFeatureStatus.READY]: {
        status: DataProviderFeatureStatus.READY,
        label: 'Sẵn sàng hoạt động',
        tagColor: 'success',
        dotClass: 'bg-emerald-500',
        icon: 'lucide:check-circle-2',
        selectable: true,
    },
    [DataProviderFeatureStatus.TESTING]: {
        status: DataProviderFeatureStatus.TESTING,
        label: 'Chạy thử nghiệm',
        tagColor: 'warning',
        dotClass: 'bg-amber-500',
        icon: 'lucide:flask-conical',
        selectable: true,
    },
    [DataProviderFeatureStatus.DISABLED]: {
        status: DataProviderFeatureStatus.DISABLED,
        label: 'Tạm ngưng',
        tagColor: 'default',
        dotClass: 'bg-slate-400',
        icon: 'lucide:pause-circle',
        selectable: true,
    },
    [DataProviderFeatureStatus.ERROR]: {
        status: DataProviderFeatureStatus.ERROR,
        label: 'Sự cố / Lỗi',
        tagColor: 'error',
        dotClass: 'bg-rose-500',
        icon: 'lucide:alert-triangle',
        selectable: false,
    },
    [DataProviderFeatureStatus.UNCONFIGURED]: {
        status: DataProviderFeatureStatus.UNCONFIGURED,
        label: 'Chưa cấu hình',
        tagColor: 'default',
        dotClass: 'bg-slate-300',
        icon: 'lucide:settings',
        selectable: false,
    },
};

export const SELECTABLE_FEATURE_STATUSES: DataProviderFeatureStatus[] = [
    DataProviderFeatureStatus.READY,
    DataProviderFeatureStatus.TESTING,
    DataProviderFeatureStatus.DISABLED,
];
