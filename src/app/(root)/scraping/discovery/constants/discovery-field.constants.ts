import type { IFieldMetadata } from '@/interfaces';
import { FormRuleType } from '@/utilities';

export const DISCOVERY_SESSION_FIELDS = {
    SESSION_CODE: {
        key: 'sessionCode',
        label: 'Mã phiên',
        table: {
            title: 'Mã phiên',
            width: '15%',
            sorter: true,
        },
    },
    DATA_PROVIDER: {
        key: 'dataProviderId',
        label: 'Nhà cung cấp',
        table: {
            title: 'Nhà cung cấp',
            width: '18%',
            ellipsis: true,
        },
        form: {
            type: 'select',
            placeholder: 'Chọn nhà cung cấp',
            rulesConfig: [
                {
                    type: FormRuleType.Required,
                    message: 'Vui lòng chọn nhà cung cấp',
                },
            ],
        },
    },
    TARGET_URL: {
        key: 'targetUrl',
        label: 'URL Khám phá',
        table: {
            title: 'URL Khám phá',
            width: '25%',
            ellipsis: true,
        },
    },
    TARGET_KEYWORDS: {
        key: 'targetKeywords',
        label: 'Từ khóa sản phẩm mục tiêu (Target Keywords)',
        form: {
            type: 'select',
            placeholder:
                'Nhập các từ khóa cách nhau bởi dấu phẩy hoặc phím Enter (ví dụ: Sony WH-1000XM4, iPhone 15 Pro, ...)',
        },
    },
    DEPTH: {
        key: 'depth',
        label: 'Độ sâu thu thập (Crawl Depth)',
        form: {
            type: 'number',
            placeholder: 'Nhập độ sâu thu thập',
        },
    },
    MAX_URLS: {
        key: 'maxUrls',
        label: 'Giới hạn URLs tối đa (Max URLs - Tùy chọn override)',
        form: {
            type: 'number',
            placeholder: 'Mặc định lấy theo cấu hình Search',
        },
    },
    AUTO_VALIDATE: {
        key: 'autoValidate',
        label: 'Tự động xác thực URL (Auto Validate)',
        description: 'Tự động kích hoạt hàng đợi xác thực các URL khám phá được ngay khi hoàn tất',
        form: {
            type: 'switch',
        },
    },
    STATUS: {
        key: 'status',
        label: 'Trạng thái',
        table: {
            title: 'Trạng thái',
            width: '12%',
            align: 'center',
        },
    },
    TOTAL_DISCOVERED: {
        key: 'totalDiscovered',
        label: 'URLs tìm thấy',
        table: {
            title: 'URLs tìm thấy',
            width: '12%',
            align: 'right',
        },
    },
    CREATED_AT: {
        key: 'createdAt',
        label: 'Ngày tạo',
        table: {
            title: 'Ngày tạo',
            width: '15%',
            sorter: true,
        },
    },
} as const satisfies Record<string, IFieldMetadata>;
